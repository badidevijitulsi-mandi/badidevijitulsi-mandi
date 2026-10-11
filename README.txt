श्री श्री बड़ी देवी जी, तुलसी मंडी — Light Yellow Premium Website
=================================================================

इस ZIP में शामिल फाइलें
----------------------
index.html   : सार्वजनिक वेबसाइट; हल्का पीला बैकग्राउंड, मरून बैनर/हेडर, गोल्ड बटन
style.css    : पूरे सार्वजनिक वेबसाइट और admin panel की styling
public.js    : Supabase से सार्वजनिक सामग्री लोड करने वाला JavaScript
admin.html   : सामग्री प्रबंधन और admin login
config.js    : Supabase Project URL और public anon key की settings
setup.sql    : Database tables, RLS policies और admin permission setup
README.txt   : ये निर्देश

डिज़ाइन
-------
डिज़ाइन आपके भेजे हुए reference layout के आधार पर बनाया गया है: hero banner, 6 quick links,
social links, 4-column gallery, 4-column videos, history/events/committee cards और
location/contact form. मुख्य रंग हल्का पीला (#FFF7DF), मरून (#650D16) और गोल्ड (#E7BB4D) हैं।
मोबाइल स्क्रीन पर कार्ड और मेन्यू responsive तरीके से stack होते हैं।

महत्वपूर्ण
----------
ZIP के अंदर placeholders/उदाहरण कार्ड दिखते हैं ताकि Supabase configure करने से पहले भी
लेआउट देखा जा सके। असली फोटो, कार्यक्रम, समिति सदस्यों और social-media links को admin panel से
जोड़ें। सन् 1932 का उल्लेख आपकी वेबसाइट की मौजूदा सामग्री के अनुरूप रखा गया है; कृपया तथ्य की
पुष्टि समिति से कर लें।

Supabase setup (deploy करने से पहले)
------------------------------------
1. Supabase project बनाएँ और SQL Editor में setup.sql चलाएँ।
2. setup.sql में admin@example.com को अपने admin email से बदलें, फिर SQL दोबारा चलाएँ।
3. Supabase Authentication में अपने admin user को बनाएँ/आमंत्रित करें और मजबूत password रखें।
4. Project Settings → API से Project URL और anon/public key लेकर config.js में भरें।
   इस फाइल में कभी भी service_role key या database password न रखें।
5. Admin panel खोलकर login करें। पहले gallery, events, committee, announcements और social URLs जोड़ें।

GitHub और Render
----------------
1. ZIP extract करें; सातों files एक ही project folder में रखें।
2. GitHub में private repository बनाएँ और project files upload करें। ZIP को extract किए बिना
   repository में रखने से Render सीधे site deploy नहीं कर पाएगा।
3. Render में New → Static Site चुनें और repository connect करें। Publish Directory में '.' रखें;
   Build Command खाली छोड़ें (क्योंकि यह static HTML/CSS/JS project है)।
4. Deploy पूरा होने पर Render URL खोलकर mobile और desktop पर जाँचें।
5. Supabase Authentication → URL Configuration में live Render URL को Site URL और allowed redirect URLs
   में जोड़ें, अगर admin login flow को इसकी जरूरत हो।

सुरक्षा
------
- Supabase anon/public key browser में इस्तेमाल करने के लिए है; table access RLS policies से सुरक्षित रहे।
- service_role key को HTML, JavaScript, config.js, GitHub या browser में कभी न डालें।
- setup.sql में admin allowlist को अपने वास्तविक email से बदलें।
- इस version का संपर्क फ़ॉर्म अभी केवल interface है; संदेश storage/notification के लिए backend table और
  सुरक्षित submit flow जोड़ना होगा। बटन पर यह बात स्पष्ट बताई जाती है।
- लाइव करने से पहले Supabase RLS, admin login और सभी links की जाँच करें।
