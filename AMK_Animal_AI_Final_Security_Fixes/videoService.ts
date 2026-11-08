export interface ExtractedFrame {
  timestampSeconds: number;
  dataUrl: string;
}

/**
 * Extracts representative keyframes from a user-uploaded video file
 * using an off-screen HTML5 video and canvas element.
 */
export async function extractVideoFrames(
  videoFile: File,
  maxFrames: number = 4,
  onProgress?: (progressPercent: number) => void
): Promise<ExtractedFrame[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const objectUrl = URL.createObjectURL(videoFile);
    video.src = objectUrl;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const frames: ExtractedFrame[] = [];

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration;
        if (!duration || duration <= 0 || isNaN(duration)) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Unable to read video duration. Please upload a valid MP4 or WebM video.'));
          return;
        }

        // Calculate timestamps to sample (e.g., at 15%, 40%, 65%, 90% of the video)
        const timestamps: number[] = [];
        const step = duration / (maxFrames + 1);
        for (let i = 1; i <= maxFrames; i++) {
          timestamps.push(i * step);
        }

        canvas.width = Math.min(video.videoWidth || 640, 1280);
        canvas.height = Math.min(video.videoHeight || 480, 720);

        for (let i = 0; i < timestamps.length; i++) {
          const time = timestamps[i];
          await seekToTime(video, time);

          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            frames.push({
              timestampSeconds: Math.round(time * 10) / 10,
              dataUrl,
            });
          }

          if (onProgress) {
            onProgress(Math.round(((i + 1) / timestamps.length) * 100));
          }
        }

        URL.revokeObjectURL(objectUrl);
        resolve(frames);
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to decode video file. Make sure it is an MP4 or WebM format.'));
    };
  });
}

function seekToTime(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };
    video.addEventListener('seeked', onSeeked);
    video.currentTime = time;
  });
}
