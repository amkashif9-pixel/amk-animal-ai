import React, { useState } from 'react';
import { useLanguage } from '../../i18n';
import { MarketplaceListing, ListingCategory, FraudReport } from '../../types/marketplace';
import {
  ShoppingBag,
  Search,
  Filter,
  Plus,
  Phone,
  MessageCircle,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Flag,
  CheckCircle,
  MapPin,
  Tag,
  Milk,
  Syringe,
  X,
  Share2,
} from 'lucide-react';

export const MarketplaceView: React.FC = () => {
  const { t, language } = useLanguage();
  const isUrdu = language === 'ur';

  // Sample verified listings
  const [listings, setListings] = useState<MarketplaceListing[]>([
    {
      id: 'list_1',
      sellerId: 'seller_101',
      sellerName: 'Haji Riaz Ahmed',
      sellerPhone: '+923346682654',
      sellerWhatsapp: '+923346682654',
      sellerIsVerified: true,
      category: 'cattle',
      titleEn: 'Pure Sahiwal Dairy Cow (16 Liters Confirmed Milk)',
      titleUr: 'خالص النسل ساہیوال گائے (16 لیٹر تصدیق شدہ دودھ، 2nd سُوا)',
      species: 'Cow',
      breed: 'Sahiwal Cow',
      age: '4 Years (چوگا)',
      gender: 'female',
      weightKg: 430,
      milkYieldLiters: 16,
      askingPrice: 425000,
      currency: 'PKR',
      isNegotiable: true,
      locationCity: 'Sahiwal',
      locationProvince: 'Punjab',
      mandiMarketName: 'Chak 5/11-L Dairy Colony',
      descriptionEn:
        'Second lactation prime Sahiwal cow. Very gentle temperament, hand and machine milked. Tested negative for mastitis, vaccinated against FMD and HS.',
      descriptionUr:
        'دوسرا سُوا، خالص ساہیوال نسل، انتہائی ٹھنڈی اور میٹھی چوائی۔ ہوانہ چاروں تھن برابر، منہ کھر اور گل گھوٹو کی ویکسین لگی ہوئی۔ موقع پر دو وقت چوائی کر کے تسلی کریں۔',
      images: [
        'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80',
      ],
      vaccinationStatus: 'fully_vaccinated',
      healthStatusDescriptionEn: 'Excellent body condition, complete deworming protocol up to date.',
      healthStatusDescriptionUr: 'مکمل صحت مند اور ڈی ورمنگ شدہ۔',
      isSold: false,
      isFeatured: true,
      isSample: true,
      isReported: false,
      reportCount: 0,
      createdAt: '2024-10-28T00:00:00Z',
      updatedAt: '2024-10-28T00:00:00Z',
    },
    {
      id: 'list_2',
      sellerId: 'seller_102',
      sellerName: 'Chaudhry Afzal Gujjar',
      sellerPhone: '+923346682654',
      sellerWhatsapp: '+923346682654',
      sellerIsVerified: true,
      category: 'buffalo',
      titleEn: 'Top Quality Nili-Ravi Panj Kalyan Buffalo (19 Liters)',
      titleUr: 'ٹاپ کوالٹی نیلی راوی پنج کلیان بھینس (19 لیٹر یومیہ دودھ)',
      species: 'Buffalo',
      breed: 'Nili-Ravi Buffalo',
      age: '5 Years (چھگی)',
      gender: 'female',
      weightKg: 620,
      milkYieldLiters: 19,
      askingPrice: 580000,
      currency: 'PKR',
      isNegotiable: true,
      locationCity: 'Okara',
      locationProvince: 'Punjab',
      mandiMarketName: 'Depalpur Dairy Belt',
      descriptionEn:
        'Panj Kalyan beauty, deep curved horns, 7.5% fat milk. Giving 19 liters milk daily with 3 weeks old female calf.',
      descriptionUr:
        'پنج کلیان نیلی راوی، گول کنڈی نما سینگ، مکھن سے بھرپور 7.5 فیصد فیٹ۔ ساتھ کٹڑی ہے، دودھ کی دونوں وقت موقع پر گارنٹی۔',
      images: [
        'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=800&q=80',
      ],
      vaccinationStatus: 'fully_vaccinated',
      healthStatusDescriptionEn: 'Dewormed and checked by Veterinary Officer.',
      healthStatusDescriptionUr: 'مکمل میڈیکل فٹنس سرٹیفکیٹ موجود ہے۔',
      isSold: false,
      isFeatured: true,
      isSample: true,
      isReported: false,
      reportCount: 0,
      createdAt: '2024-10-29T00:00:00Z',
      updatedAt: '2024-10-29T00:00:00Z',
    },
    {
      id: 'list_3',
      sellerId: 'seller_103',
      sellerName: 'Malik Zeeshan Awan',
      sellerPhone: '+923346682654',
      sellerWhatsapp: '+923346682654',
      sellerIsVerified: true,
      category: 'sheep',
      titleEn: 'Prize Champion Kajli Chhatra (Two Teeth / دوندہ)',
      titleUr: 'مقابلہ حسن کا انعام یافتہ کجلی چھترا (دوندہ، 92 کلو زندہ وزن)',
      species: 'Sheep',
      breed: 'Kajli Sheep',
      age: '2.5 Years (دوندہ)',
      gender: 'male',
      weightKg: 92,
      askingPrice: 285000,
      currency: 'PKR',
      isNegotiable: false,
      locationCity: 'Sargodha',
      locationProvince: 'Punjab',
      mandiMarketName: 'Bhagtanwala Kajli Stud Farm',
      descriptionEn:
        'Snow white body with dark kajal eye rings and curved horns. Weighs 92 kg live. Supreme stud for breeding or Qurbani sacrifice.',
      descriptionUr:
        'برف جیسا سفید جسم اور آنکھوں کے گرد کالی گہری کاجل لکیر۔ لمبا قد، چوڑا سینہ اور شاہانہ چال۔ بریڈنگ اور قربانی دونوں کے لیے شاہکار۔',
      images: [
        'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=800&q=80',
      ],
      vaccinationStatus: 'fully_vaccinated',
      healthStatusDescriptionEn: 'Vaccinated with ETV and Sheep Pox. Clean foot rot history.',
      healthStatusDescriptionUr: 'ای ٹی وی اور چیچک کی ویکسین مکمل ہے۔',
      isSold: false,
      isFeatured: true,
      isSample: true,
      isReported: false,
      reportCount: 0,
      createdAt: '2024-10-30T00:00:00Z',
      updatedAt: '2024-10-30T00:00:00Z',
    },
    {
      id: 'list_4',
      sellerId: 'seller_104',
      sellerName: 'Mian Tariq Gujjar',
      sellerPhone: '+923346682654',
      sellerWhatsapp: '+923346682654',
      sellerIsVerified: true,
      category: 'goats',
      titleEn: 'Pure Makhi Cheeni Beetal Buck (Heavy 78 Kg)',
      titleUr: 'خالص مکھی چینی بیتل بکرا (بھاری وزن 78 کلو، چوڑے کان)',
      species: 'Goat',
      breed: 'Beetal Goat',
      age: '2 Years (دوندہ)',
      gender: 'male',
      weightKg: 78,
      askingPrice: 195000,
      currency: 'PKR',
      isNegotiable: true,
      locationCity: 'Faisalabad',
      locationProvince: 'Punjab',
      mandiMarketName: 'Jhang Road Mandi',
      descriptionEn:
        'Long hanging ears, curved horns, healthy coat and energetic stance. Top genetic stock for dairy farm breeding and premium sacrifice.',
      descriptionUr:
        'لمبے لٹکتے چوڑے کان، چمکیلی مکھی چینی کھال اور مضبوط ہڈی۔ بریڈنگ اور شوقین افراد کے لیے لاجواب تحفہ۔',
      images: [
        'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=800&q=80',
      ],
      vaccinationStatus: 'fully_vaccinated',
      healthStatusDescriptionEn: 'Vaccinated against PPR and Enterotoxaemia.',
      healthStatusDescriptionUr: 'پی پی آر اور انتڑیو کے زہر کا حفاظتی ٹیکہ مکمل ہے۔',
      isSold: false,
      isFeatured: true,
      isSample: true,
      isReported: false,
      reportCount: 0,
      createdAt: '2024-10-31T00:00:00Z',
      updatedAt: '2024-10-31T00:00:00Z',
    },
    {
      id: 'list_5',
      sellerId: 'seller_105',
      sellerName: 'Chaudhry Bilal Warraich',
      sellerPhone: '+923346682654',
      sellerWhatsapp: '+923346682654',
      sellerIsVerified: true,
      category: 'cattle',
      titleEn: 'Heavy Sahiwal Feedlot Fattening Bull (580 Kg Live Weight)',
      titleUr: 'ہیوی ساہیوال فیڈ لاٹ بیل (580 کلو زندہ وزن، پرائم بیف ماربلنگ)',
      species: 'Bull',
      breed: 'Sahiwal Cow',
      age: '3.5 Years (چوگا)',
      gender: 'male',
      weightKg: 580,
      askingPrice: 650000,
      currency: 'PKR',
      isNegotiable: true,
      locationCity: 'Multan',
      locationProvince: 'Punjab',
      mandiMarketName: 'Multan Cattle Market',
      descriptionEn:
        'Finished on maize silage, Rhodes grass, and high protein grain ration. Ready for slaughter or elite sacrifice with expected carcass dressing yield above 56%.',
      descriptionUr:
        'مکئی کے سائیلج اور پروٹین ونڈے پر تیار شدہ خوبصورت کوہان والا ساہیوال سانڈ/بیل۔ متوقع کارکس ڈریسنگ 56 فیصد سے زائد۔',
      images: [
        'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80',
      ],
      vaccinationStatus: 'fully_vaccinated',
      healthStatusDescriptionEn: 'Full quarantine record and veterinary certificate available.',
      healthStatusDescriptionUr: 'مکمل ویٹرنری میڈیکل فٹنس سرٹیفکیٹ تصدیق شدہ ہے۔',
      isSold: false,
      isFeatured: true,
      isSample: true,
      isReported: false,
      reportCount: 0,
      createdAt: '2024-11-01T00:00:00Z',
      updatedAt: '2024-11-01T00:00:00Z',
    },
  ]);

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reportingListingId, setReportingListingId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>('fake_price');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // New Listing Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ListingCategory>('cattle');
  const [newSpecies, setNewSpecies] = useState('Cow');
  const [newBreed, setNewBreed] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newPrice, setNewPrice] = useState<number>(300000);
  const [newMilk, setNewMilk] = useState<number>(0);
  const [newCity, setNewCity] = useState('Lahore');
  const [newPhone, setNewPhone] = useState('+923346682654');
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState('');

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    const created: MarketplaceListing = {
      id: 'list_' + Date.now(),
      sellerId: 'user_current',
      sellerName: 'Registered Livestock Owner',
      sellerPhone: newPhone,
      sellerWhatsapp: newPhone,
      sellerIsVerified: true,
      category: newCategory,
      titleEn: newTitle,
      titleUr: newTitle,
      species: newSpecies,
      breed: newBreed || newSpecies,
      age: newAge || 'Adult',
      gender: 'female',
      milkYieldLiters: newMilk > 0 ? newMilk : undefined,
      askingPrice: newPrice,
      currency: 'PKR',
      isNegotiable: true,
      locationCity: newCity,
      locationProvince: 'Punjab',
      descriptionEn: newDesc,
      descriptionUr: newDesc,
      images: [
        newImage ||
          'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80',
      ],
      vaccinationStatus: 'fully_vaccinated',
      healthStatusDescriptionEn: 'Healthy animal',
      healthStatusDescriptionUr: 'صحت مند جانور',
      isSold: false,
      isFeatured: false,
      isReported: false,
      reportCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setListings([created, ...listings]);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reportingListingId) {
      setListings((prev) =>
        prev.map((l) =>
          l.id === reportingListingId ? { ...l, isReported: true, reportCount: l.reportCount + 1 } : l
        )
      );
      setReportSubmitted(true);
      setTimeout(() => {
        setReportSubmitted(false);
        setReportingListingId(null);
        setReportDetails('');
      }, 1500);
    }
  };

  const filteredListings = listings.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedCity !== 'all' && item.locationCity !== selectedCity) return false;
    if (verifiedOnly && !item.sellerIsVerified) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.titleEn.toLowerCase().includes(q) ||
        item.titleUr.toLowerCase().includes(q) ||
        item.breed.toLowerCase().includes(q) ||
        item.locationCity.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold mb-2">
            <ShoppingBag className="w-4 h-4 text-brand-600" />
            <span>{isUrdu ? 'اصلی بیوپاری اور کسان' : 'Verified Direct Livestock Marketplace'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.marketplace.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.marketplace.subtitle}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t.marketplace.createListing}</span>
        </button>
      </div>

      {/* Demo Marketplace Notice Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3 text-xs leading-relaxed">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-extrabold text-amber-900 mb-0.5">
            {isUrdu ? 'نمائش و ڈیمو منڈی نوٹس — برائے آزمائش' : 'Demonstration Marketplace Notice — Reference Catalog'}
          </div>
          <p className="text-amber-800">
            {isUrdu
              ? 'نیچے موجود تمام اشتہارات صرف پلیٹ فارم ڈیمو اور جانچ کے نمونے ہیں۔ یہ فعال براہِ راست فروخت کی پیشکش نہیں ہیں۔ تمام قیمتیں محض فرضی ریفرنس ہیں۔ اگر آپ اپنا حقیقی جانور فروخت کے لیے لسٹ کرنا چاہتے ہیں یا کوئی سوال ہے تو اے ایم کے پلیٹ فارم ہیلپ لائن (+923346682654) سے رابطہ کریں۔'
              : 'All animal listings displayed below are demonstration placeholders to preview layout and features. They are NOT live sale offers, and displayed prices are demo reference estimates only. To register genuine livestock for sale or make inquiries, contact the official AMK Animal AI platform helpline (+923346682654).'}
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.marketplace.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="all">{t.marketplace.allCategories}</option>
              <option value="cattle">Cattle / گائے و بیل</option>
              <option value="buffalo">Buffalo / بھینس</option>
              <option value="goats">Goats / بکریاں</option>
              <option value="sheep">Sheep / بھیڑ و چھترے</option>
              <option value="poultry">Poultry / اصیل و دیسی</option>
              <option value="horses">Horses / گھوڑے</option>
            </select>
          </div>

          {/* City Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="all">{t.marketplace.filterByCity}</option>
              <option value="Sahiwal">Sahiwal (ساہیوال)</option>
              <option value="Lahore">Lahore (لاہور)</option>
              <option value="Okara">Okara (اوکاڑہ)</option>
              <option value="Sargodha">Sargodha (سرگودھا)</option>
              <option value="Faisalabad">Faisalabad (فیصل آباد)</option>
              <option value="Multan">Multan (ملتان)</option>
              <option value="Karachi">Karachi (کراچی)</option>
            </select>
          </div>

          {/* Verified Checkbox */}
          <div className="md:col-span-2 flex items-center justify-start md:justify-center">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.marketplace.verifiedSellerOnly}</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">
            {isUrdu ? 'آپ کے تلاش کے مطابق کوئی اشتہار نہیں ملا۔' : 'No listings found matching your search filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group"
            >
              {/* Photo Box with Badges */}
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={item.images[0]}
                  alt={item.titleEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {item.isSample ? (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 border border-amber-300">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-950" />
                    <span>{isUrdu ? 'نمونہ اشتہار — برائے فروخت نہیں' : 'Sample Listing — Not Available for Sale'}</span>
                  </span>
                ) : item.isFeatured ? (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                    Featured
                  </span>
                ) : null}

                {item.sellerIsVerified && !item.isSample && (
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                )}

                {item.isSample ? (
                  <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-white border border-slate-700/60 shadow-lg">
                    <div className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wide">
                      {isUrdu ? 'نمونہ تخمینی ریفرنس قیمت' : 'Demo Reference Price'}
                    </div>
                    <div className="font-black text-sm text-white">
                      {item.currency} {item.askingPrice.toLocaleString()}
                      <span className="text-[10px] font-medium text-slate-400 ml-1.5 font-normal">
                        ({isUrdu ? 'غیر فعال پیشکش' : 'Not Active Offer'})
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl text-white font-black text-sm">
                    {item.currency} {item.askingPrice.toLocaleString()}
                    {item.isNegotiable && (
                      <span className="text-[10px] font-medium text-slate-300 ml-1.5 font-normal">
                        ({isUrdu ? 'کمی بیشی ممکن' : 'Negotiable'})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-brand-700">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{item.locationCity}, {item.locationProvince}</span>
                    </span>
                    <span>•</span>
                    <span>{item.breed}</span>
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900 line-clamp-2 leading-snug">
                    {isUrdu ? item.titleUr : item.titleEn}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {isUrdu ? item.descriptionUr : item.descriptionEn}
                  </p>

                  {/* Highlights (Milk / Vaccinated) */}
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                    {item.milkYieldLiters && (
                      <span className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-800 font-bold border border-brand-200 flex items-center gap-1">
                        <Milk className="w-3.5 h-3.5" />
                        <span>{item.milkYieldLiters} L/day</span>
                      </span>
                    )}

                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold flex items-center gap-1">
                      <Syringe className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.marketplace.vaccinated}</span>
                    </span>
                  </div>
                </div>

                {/* Seller & Contact Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-xs">
                    <span className="text-[10px] text-slate-400 block">{isUrdu ? 'بیچنے والا' : 'Seller'}:</span>
                    <span className="font-extrabold text-slate-800 block truncate max-w-[120px]">
                      {item.sellerName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Report listing button */}
                    <button
                      onClick={() => setReportingListingId(item.id)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-slate-50 transition"
                      title={t.marketplace.reportListing}
                    >
                      <Flag className="w-4 h-4" />
                    </button>

                    {/* Direct WhatsApp Call to Action */}
                    <a
                      href={`https://wa.me/${item.sellerWhatsapp.replace(/[^0-9]/g, '')}?text=Assalam-o-Alaikum,%20I%20am%20inquiring%20about%20the%20demo%20marketplace%20listing:%20${encodeURIComponent(item.titleEn)}%20on%20AMK%20Animal%20AI`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>{item.isSample ? (isUrdu ? 'اے ایم کے ہیلپ لائن' : 'AMK Helpline') : (isUrdu ? 'واٹس ایپ' : 'WhatsApp')}</span>
                    </a>

                    <a
                      href={`tel:${item.sellerPhone}`}
                      className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                      title={item.isSample ? (isUrdu ? 'اے ایم کے ہیلپ لائن کال' : 'Call AMK Platform Helpline') : t.marketplace.callSeller}
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fraud Report Modal (Requirement 11) */}
      {reportingListingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 text-red-600">
                <Flag className="w-5 h-5" />
                <span>{t.marketplace.reportListing}</span>
              </h3>
              <button
                onClick={() => setReportingListingId(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {t.marketplace.reportPrompt}
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {t.marketplace.reportReason}
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <option value="fake_price">{isUrdu ? 'جعلی یا گمراہ کن قیمت' : 'Unrealistic / Fake Price'}</option>
                  <option value="stolen_photos">{isUrdu ? 'انٹرنیٹ سے چوری شدہ تصاویر' : 'Stolen / Copied Photos'}</option>
                  <option value="wrong_breed">{isUrdu ? 'نسل کے بارے میں غلط بیانی' : 'Misrepresented Breed / Specs'}</option>
                  <option value="sick_animal">{isUrdu ? 'بیمار یا معذور جانور' : 'Sick or Diseased Animal'}</option>
                  <option value="fraud_seller">{isUrdu ? 'فراڈ بیوپاری یا ایڈوانس رقم کا مطالبہ' : 'Fraud Seller / Demanding Advance'}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {isUrdu ? 'تفصیل درج کریں' : 'Additional Details'}
                </label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Explain why this listing should be flagged..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
              </div>

              {reportSubmitted && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{t.marketplace.reportSuccess}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReportingListingId(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  {isUrdu ? 'منسوخ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition"
                >
                  {isUrdu ? 'رپورٹ جمع کروائیں' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Animal For Sale Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                {t.marketplace.createListing}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {isUrdu ? 'اشتہار کا عنوان' : 'Listing Title'} *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Pure Sahiwal Cow (16 Liters Milk)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    {isUrdu ? 'کیٹیگری' : 'Category'}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="cattle">Cattle / گائے و بیل</option>
                    <option value="buffalo">Buffalo / بھینس</option>
                    <option value="goats">Goat / بکری</option>
                    <option value="sheep">Sheep / بھیڑ و چھترا</option>
                    <option value="poultry">Poultry / مرغی</option>
                    <option value="horses">Horse / گھوڑا</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    {t.market.breed}
                  </label>
                  <input
                    type="text"
                    value={newBreed}
                    onChange={(e) => setNewBreed(e.target.value)}
                    placeholder="e.g. Sahiwal, Nili-Ravi"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    {t.marketplace.askingPrice} (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    {t.marketplace.milkYield} (L/day)
                  </label>
                  <input
                    type="number"
                    value={newMilk}
                    onChange={(e) => setNewMilk(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    {isUrdu ? 'شہر / منڈی' : 'City / Mandi'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Sahiwal, Okara, Lahore..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    {isUrdu ? 'فون / واٹس ایپ نمبر' : 'Phone / WhatsApp'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+923346682654"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {isUrdu ? 'تصویر کا لنک (Image URL)' : 'Image URL'}
                </label>
                <input
                  type="text"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {isUrdu ? 'تفصیل و صحت کا بیان' : 'Detailed Description & Health'}
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe teeth count, lactation stage, temperament..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  {isUrdu ? 'منسوخ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition"
                >
                  {isUrdu ? 'اشتہار شائع کریں' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
