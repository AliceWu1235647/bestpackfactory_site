// The 12 category tiles on the homepage all carried the same sentence — "MOQ 500
// PCS. Factory direct quote with custom size, material, logo and finish." — and the
// same alt-text template, "<Name> custom packaging manufacturer". Repeated across the
// English homepage and all five locale mirrors that is 72 tiles carrying 6 distinct
// strings between them, which gives a search engine nothing to tell the categories
// apart and gives an answer engine nothing worth quoting.
//
// Every replacement sentence below is drawn from the matching product page's own
// technical specification table (board grades, film structures, barrier targets,
// closure and neck sizes), so the homepage now agrees with the page it links to
// instead of restating the MOQ twelve times. The MOQ has not been deleted from the
// page — it stays in the hero bullet list and the section intro, stated once.
//
// Alt text was rewritten against the actual image files rather than the category
// name, so each one describes what is in the photograph.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'content-site');
const apply = !process.argv.includes('--dry-run');

// Keyed by product slug, which is the one stable identifier shared by the English
// page and every locale mirror — the headings, hrefs and existing copy are all
// translated, the slug in the href is not.
const SLUGS = [
  'custom-boxes',
  'flexible-packaging',
  'luxury-magnetic-boxes',
  'food-packaging',
  'pharma-packaging',
  'coffee-bags',
  'pet-food-bags',
  'cannabis-mylar-bags',
  'paper-bags',
  'labels-stickers',
  'pet-bottles',
  'tin-boxes'
];

const COPY = {
  en: {
    intro: 'Twelve production lines under one RFQ: paperboard, corrugated, flexible film, labels, PET and tinplate. MOQ 500 PCS, free dieline within 24 hours.',
    tiles: {
      'custom-boxes': {
        alt: 'Assortment of custom printed mailer and rigid boxes with foil-stamped brand logos',
        text: 'Corrugated mailers and rigid boxes in E, B and BC flute, 3-ply or 5-ply, built to a 32 ECT export strength target.'
      },
      'flexible-packaging': {
        alt: 'Custom stand-up pouches, flat-bottom bags and printed roll film for food and snack brands',
        text: 'Laminated stand-up pouches and printed roll stock from 90 to 160 micron, with metalised or aluminium foil barrier layers.'
      },
      'luxury-magnetic-boxes': {
        alt: 'Magnetic closure gift boxes with gold foil artwork, satin lining and ribbon trim',
        text: 'Rigid and foldable magnetic-closure boxes with wrapped covers, foil or soft-touch finishes and fitted inserts.'
      },
      'food-packaging': {
        alt: 'Branded takeaway food packaging including burger boxes, fry cartons, cups, sandwich packs and kraft bags',
        text: 'Burger boxes, fry cartons, cups, sandwich packs and takeaway bags on grease-resistant board with food-contact coatings.'
      },
      'pharma-packaging': {
        alt: 'Pharmaceutical carton, tablet bottle, cream jar, tube and vial in matching branded artwork',
        text: 'Folding cartons on 300 to 400 gsm board with GS1 DataMatrix serialisation verified to ISO/IEC 15415 at print approval.'
      },
      'coffee-bags': {
        alt: 'Black flat-bottom coffee bag with a one-way degassing valve and press-to-close zipper',
        text: 'Flat-bottom and side-gusset coffee bags with a one-way degassing valve and high-barrier film for 250 g to 1 kg fills.'
      },
      'pet-food-bags': {
        alt: 'Large stand-up dog food bag printed edge to edge with brand artwork',
        text: 'Heavy-duty pet food pouches at 120 to 180 micron, with foil structures for high-fat kibble and reinforced side seals.'
      },
      'cannabis-mylar-bags': {
        alt: 'Green stand-up cannabis mylar bag with a resealable zipper and net weight panel',
        text: 'Smell-proof aluminium foil mylar bags with optional child-resistant zippers and a low oxygen transmission target.'
      },
      'paper-bags': {
        alt: 'Kraft, white and pink retail paper bags with rope and satin ribbon handles',
        text: 'Kraft and coated paper bags for retail, gift and takeaway, with twisted rope, ribbon or die-cut handles.'
      },
      'labels-stickers': {
        alt: 'Printed label rolls, die-cut stickers and sheet labels for coffee, skincare and candle brands',
        text: 'Roll and die-cut labels on paper, BOPP, PET or holographic face stock, with permanent, removable or freezer adhesive.'
      },
      'pet-bottles': {
        alt: 'Clear and amber PET bottles and jars for supplements, tablets and beverages',
        text: 'Food-grade PET bottles and jars from 30 ml to 1000 ml, with 18/410 to 38 mm neck finishes and matched closures.'
      },
      'tin-boxes': {
        alt: 'Silver round tin, green rectangular tea tin and lilac square lip balm tin with gold detailing',
        text: 'Tinplate tins in hinged, slip-lid, window, round or rectangular formats, with food-safe inner lacquer and offset printing.'
      }
    }
  },

  de: {
    intro: 'Zwölf Produktionslinien in einer Anfrage: Karton, Wellpappe, Folienverbunde, Etiketten, PET und Weißblech. MOQ 500 Stück, kostenlose Stanzkontur innerhalb von 24 Stunden.',
    tiles: {
      'custom-boxes': {
        alt: 'Sortiment bedruckter Versand- und Stülpdeckelschachteln mit heißfolienveredelten Markenlogos',
        text: 'Wellpapp-Versandkartons und Stülpdeckelschachteln in E-, B- und BC-Welle, 3- oder 5-lagig, ausgelegt auf 32 ECT für den Export.'
      },
      'flexible-packaging': {
        alt: 'Standbodenbeutel, Flachbodenbeutel und bedruckte Rollenware für Lebensmittel- und Snackmarken',
        text: 'Kaschierte Standbodenbeutel und bedruckte Rollenware von 90 bis 160 Mikrometer, mit metallisierter oder Aluminium-Barriereschicht.'
      },
      'luxury-magnetic-boxes': {
        alt: 'Geschenkboxen mit Magnetverschluss, Goldfolienprägung, Satinfütterung und Schleifenband',
        text: 'Starre und faltbare Magnetklappboxen mit kaschierten Deckeln, Folien- oder Soft-Touch-Veredelung und passgenauen Inlays.'
      },
      'food-packaging': {
        alt: 'Bedruckte Take-away-Verpackungen: Burgerboxen, Pommes-Schütten, Becher, Sandwichboxen und Kraftpapiertüten',
        text: 'Burgerboxen, Pommes-Schütten, Becher, Sandwichboxen und Tragetaschen aus fettdichtem Karton mit lebensmittelechter Beschichtung.'
      },
      'pharma-packaging': {
        alt: 'Pharma-Faltschachtel, Tablettenflasche, Cremetiegel, Tube und Vial im einheitlichen Markendesign',
        text: 'Faltschachteln auf 300 bis 400 g/m² Karton mit GS1-DataMatrix-Serialisierung, geprüft nach ISO/IEC 15415 bei der Druckfreigabe.'
      },
      'coffee-bags': {
        alt: 'Schwarzer Flachbodenbeutel für Kaffee mit Einweg-Aromaventil und Druckverschluss',
        text: 'Flachboden- und Seitenfaltenbeutel für Kaffee mit Einweg-Aromaventil und Hochbarrierefolie für Füllmengen von 250 g bis 1 kg.'
      },
      'pet-food-bags': {
        alt: 'Großer Standbodenbeutel für Hundefutter mit vollflächigem Markendruck',
        text: 'Robuste Tierfutterbeutel mit 120 bis 180 Mikrometer Verbund, Aluminiumstruktur für fetthaltiges Trockenfutter und verstärkten Seitennähten.'
      },
      'cannabis-mylar-bags': {
        alt: 'Grüner Standbodenbeutel aus Mylar für Cannabis mit wiederverschließbarem Zipper und Füllgewichtsangabe',
        text: 'Geruchsdichte Mylar-Beutel mit Aluminiumbarriere, optionalem kindersicherem Zipper und sehr niedriger Sauerstoffdurchlässigkeit.'
      },
      'paper-bags': {
        alt: 'Papiertragetaschen in Kraft, Weiß und Rosé mit Kordel- und Satinbandgriffen',
        text: 'Papiertragetaschen aus Kraft- oder gestrichenem Papier für Retail, Geschenk und Take-away, mit Kordel-, Band- oder Stanzgriff.'
      },
      'labels-stickers': {
        alt: 'Bedruckte Etikettenrollen, gestanzte Sticker und Bogenetiketten für Kaffee-, Kosmetik- und Kerzenmarken',
        text: 'Rollen- und Stanzetiketten auf Papier, BOPP, PET oder Hologrammfolie, mit permanentem, ablösbarem oder Tiefkühlkleber.'
      },
      'pet-bottles': {
        alt: 'Klare und bernsteinfarbene PET-Flaschen und -Dosen für Nahrungsergänzung, Tabletten und Getränke',
        text: 'PET-Flaschen und -Dosen in Lebensmittelqualität von 30 ml bis 1000 ml, mit Halsgewinde 18/410 bis 38 mm und passenden Verschlüssen.'
      },
      'tin-boxes': {
        alt: 'Silberne Runddose, grüne rechteckige Teedose und flieder-farbene quadratische Lippenbalsamdose mit Goldakzenten',
        text: 'Weißblechdosen als Scharnier-, Stülpdeckel-, Fenster-, Rund- oder Rechteckdose, mit lebensmittelechtem Innenlack und Offsetdruck.'
      }
    }
  },

  es: {
    intro: 'Doce líneas de producción en una sola solicitud: cartoncillo, cartón ondulado, film flexible, etiquetas, PET y hojalata. MOQ 500 PCS, troquel gratuito en 24 horas.',
    tiles: {
      'custom-boxes': {
        alt: 'Surtido de cajas de envío y cajas rígidas impresas con logotipos estampados en lámina',
        text: 'Cajas de envío en cartón ondulado y cajas rígidas en canal E, B y BC, de 3 o 5 capas, con objetivo de 32 ECT para exportación.'
      },
      'flexible-packaging': {
        alt: 'Bolsas doypack, bolsas de fondo plano y film en rollo impreso para marcas de alimentación y snacks',
        text: 'Bolsas doypack laminadas y film en rollo de 90 a 160 micras, con capas barrera metalizadas o de aluminio.'
      },
      'luxury-magnetic-boxes': {
        alt: 'Cajas de regalo con cierre magnético, estampación en oro, forro de satén y cinta',
        text: 'Cajas de cierre magnético rígidas y plegables, con forrado exterior, acabados en lámina o soft-touch e interiores a medida.'
      },
      'food-packaging': {
        alt: 'Envases de comida para llevar impresos: cajas de hamburguesa, cucuruchos de patatas, vasos, packs de sándwich y bolsas kraft',
        text: 'Cajas de hamburguesa, cucuruchos, vasos, packs de sándwich y bolsas para llevar en cartón antigrasa con recubrimiento apto para alimentos.'
      },
      'pharma-packaging': {
        alt: 'Estuche farmacéutico, frasco de comprimidos, tarro de crema, tubo y vial con diseño de marca coordinado',
        text: 'Estuches plegables en cartón de 300 a 400 gsm con serialización GS1 DataMatrix verificada según ISO/IEC 15415 en la aprobación de impresión.'
      },
      'coffee-bags': {
        alt: 'Bolsa de café negra de fondo plano con válvula desgasificadora unidireccional y cierre zip',
        text: 'Bolsas de café de fondo plano y fuelle lateral con válvula desgasificadora unidireccional y film de alta barrera para 250 g a 1 kg.'
      },
      'pet-food-bags': {
        alt: 'Bolsa doypack grande de comida para perros con impresión de marca a sangre completa',
        text: 'Bolsas para comida de mascotas de alta resistencia, de 120 a 180 micras, con estructuras de aluminio para pienso graso y sellados reforzados.'
      },
      'cannabis-mylar-bags': {
        alt: 'Bolsa mylar verde para cannabis con cierre zip resellable y panel de peso neto',
        text: 'Bolsas mylar antiolor con barrera de aluminio, cierre a prueba de niños opcional y transmisión de oxígeno muy baja.'
      },
      'paper-bags': {
        alt: 'Bolsas de papel retail en kraft, blanco y rosa con asas de cordón y cinta de satén',
        text: 'Bolsas de papel kraft o estucado para retail, regalo y comida para llevar, con asa de cordón, cinta o troquelada.'
      },
      'labels-stickers': {
        alt: 'Rollos de etiquetas impresas, pegatinas troqueladas y etiquetas en hoja para marcas de café, cosmética y velas',
        text: 'Etiquetas en rollo y troqueladas sobre papel, BOPP, PET u holográfico, con adhesivo permanente, removible o para congelado.'
      },
      'pet-bottles': {
        alt: 'Botes y botellas de PET transparentes y ámbar para suplementos, comprimidos y bebidas',
        text: 'Botellas y botes de PET de grado alimentario de 30 ml a 1000 ml, con bocas de 18/410 a 38 mm y tapones a juego.'
      },
      'tin-boxes': {
        alt: 'Lata redonda plateada, lata de té rectangular verde y lata cuadrada lila de bálsamo labial con detalles dorados',
        text: 'Latas de hojalata con bisagra, tapa deslizante, ventana, redondas o rectangulares, con laca interior alimentaria e impresión offset.'
      }
    }
  },

  fr: {
    intro: 'Douze lignes de production dans une seule demande : carton compact, ondulé, film souple, étiquettes, PET et fer-blanc. MOQ 500 pièces, tracé de découpe offert sous 24 heures.',
    tiles: {
      'custom-boxes': {
        alt: 'Assortiment de boîtes d\'expédition et de boîtes rigides imprimées avec logos marqués à chaud',
        text: 'Boîtes d\'expédition en carton ondulé et boîtes rigides en cannelure E, B et BC, 3 ou 5 plis, calibrées à 32 ECT pour l\'export.'
      },
      'flexible-packaging': {
        alt: 'Sachets doypack, sachets à fond plat et film en rouleau imprimé pour marques alimentaires et snacking',
        text: 'Sachets doypack complexés et film en rouleau de 90 à 160 microns, avec couches barrière métallisées ou aluminium.'
      },
      'luxury-magnetic-boxes': {
        alt: 'Boîtes cadeaux à fermeture magnétique avec dorure à chaud, doublure satin et ruban',
        text: 'Boîtes à fermeture magnétique rigides ou pliables, habillage papier, finitions dorure ou soft-touch et calages sur mesure.'
      },
      'food-packaging': {
        alt: 'Emballages à emporter imprimés : boîtes burger, cornets à frites, gobelets, packs sandwich et sacs kraft',
        text: 'Boîtes burger, cornets, gobelets, packs sandwich et sacs à emporter en carton anti-gras avec revêtement contact alimentaire.'
      },
      'pharma-packaging': {
        alt: 'Étui pharmaceutique, flacon de comprimés, pot de crème, tube et flacon injectable au design de marque coordonné',
        text: 'Étuis pliants sur carton 300 à 400 g/m² avec sérialisation GS1 DataMatrix vérifiée selon ISO/IEC 15415 au bon à tirer.'
      },
      'coffee-bags': {
        alt: 'Sachet de café noir à fond plat avec valve de dégazage unidirectionnelle et fermeture zip',
        text: 'Sachets de café à fond plat ou à soufflets latéraux, valve de dégazage unidirectionnelle et film haute barrière de 250 g à 1 kg.'
      },
      'pet-food-bags': {
        alt: 'Grand sachet doypack pour aliments pour chiens imprimé à fond perdu',
        text: 'Sachets pour aliments pour animaux renforcés, de 120 à 180 microns, structures aluminium pour croquettes grasses et soudures renforcées.'
      },
      'cannabis-mylar-bags': {
        alt: 'Sachet mylar vert pour cannabis avec fermeture zip refermable et mention de poids net',
        text: 'Sachets mylar anti-odeur à barrière aluminium, fermeture sécurité enfant en option et perméabilité à l\'oxygène très faible.'
      },
      'paper-bags': {
        alt: 'Sacs en papier retail kraft, blanc et rose avec poignées cordelette et ruban satin',
        text: 'Sacs en papier kraft ou couché pour le retail, le cadeau et la vente à emporter, à poignées cordelette, ruban ou découpées.'
      },
      'labels-stickers': {
        alt: 'Rouleaux d\'étiquettes imprimées, stickers découpés et étiquettes en planche pour marques de café, cosmétique et bougies',
        text: 'Étiquettes en rouleau et découpées sur papier, BOPP, PET ou holographique, avec adhésif permanent, repositionnable ou grand froid.'
      },
      'pet-bottles': {
        alt: 'Flacons et pots PET transparents et ambrés pour compléments, comprimés et boissons',
        text: 'Flacons et pots PET de qualité alimentaire de 30 ml à 1000 ml, bagues 18/410 à 38 mm et bouchages assortis.'
      },
      'tin-boxes': {
        alt: 'Boîte ronde argentée, boîte à thé rectangulaire verte et boîte carrée lilas de baume à lèvres à finitions dorées',
        text: 'Boîtes en fer-blanc à charnière, couvercle glissant, fenêtre, rondes ou rectangulaires, vernis intérieur alimentaire et impression offset.'
      }
    }
  },

  ja: {
    intro: '板紙・段ボール・軟包装フィルム・ラベル・PET・ブリキの12ラインを1件の見積依頼で。MOQ 500個、抜き型データは24時間以内に無料提供。',
    tiles: {
      'custom-boxes': {
        alt: 'ブランドロゴを箔押しした宅配箱と貼り箱の詰め合わせ',
        text: 'Eフルート・Bフルート・BCフルートの段ボール宅配箱と貼り箱。3層または5層、輸出向けに32 ECTを目標強度に設計します。'
      },
      'flexible-packaging': {
        alt: '食品・スナックブランド向けのスタンドパウチ、平底パウチ、印刷ロールフィルム',
        text: '90〜160ミクロンのラミネートスタンドパウチと印刷ロール原反。蒸着またはアルミ箔のバリア層を選択できます。'
      },
      'luxury-magnetic-boxes': {
        alt: '金箔加工・サテン内貼り・リボン付きのマグネット式ギフトボックス',
        text: '貼り箱型と折りたたみ型のマグネット開閉ボックス。外装貼り、箔押しまたはソフトタッチ加工、専用中仕切りに対応します。'
      },
      'food-packaging': {
        alt: 'バーガーボックス、ポテトカートン、カップ、サンドイッチパック、クラフト袋などの印刷済みテイクアウト容器',
        text: 'バーガーボックス、ポテトカートン、カップ、サンドイッチパック、テイクアウト袋。耐油板紙に食品接触対応コーティングを施します。'
      },
      'pharma-packaging': {
        alt: '統一デザインの医薬品用カートン、錠剤ボトル、クリーム容器、チューブ、バイアル',
        text: '300〜400gsm板紙の折箱に、印刷承認時にISO/IEC 15415で検証したGS1データマトリックスのシリアル化を適用します。'
      },
      'coffee-bags': {
        alt: 'ワンウェイアロマバルブとチャック付きの黒い平底コーヒーバッグ',
        text: '平底・サイドガゼットのコーヒーバッグ。ワンウェイアロマバルブと高バリアフィルムで250g〜1kgの充填に対応します。'
      },
      'pet-food-bags': {
        alt: 'ブランドデザインを全面印刷した大型スタンドパウチのドッグフード袋',
        text: '120〜180ミクロンの高強度ペットフードパウチ。高脂肪のドライフード向けアルミ構成とサイドシール補強に対応します。'
      },
      'cannabis-mylar-bags': {
        alt: '再封チャックと内容量表示を備えた緑色のカンナビス用スタンドマイラーバッグ',
        text: 'アルミバリアの防臭マイラーバッグ。チャイルドレジスタントチャックを選択でき、酸素透過度を極めて低く抑えます。'
      },
      'paper-bags': {
        alt: '紐手提げとサテンリボン手提げのクラフト・白・ピンクの紙袋',
        text: '小売・ギフト・テイクアウト向けのクラフト紙／コート紙の手提げ袋。紐、リボン、打ち抜きの各ハンドルに対応します。'
      },
      'labels-stickers': {
        alt: 'コーヒー・スキンケア・キャンドルブランド向けの印刷ラベルロール、打ち抜きステッカー、シートラベル',
        text: '紙、BOPP、PET、ホログラムの原紙によるロールラベルと打ち抜きラベル。強粘着、再剥離、冷凍用粘着から選べます。'
      },
      'pet-bottles': {
        alt: 'サプリメント・錠剤・飲料向けの透明およびアンバーのPETボトルとPETジャー',
        text: '30ml〜1000mlの食品グレードPETボトル・ジャー。18/410〜38mmのネック仕様と対応キャップを用意します。'
      },
      'tin-boxes': {
        alt: '金の装飾を施したシルバーの丸缶、緑の角形ティー缶、ライラック色の角形リップバーム缶',
        text: 'ヒンジ、スライド蓋、窓付き、丸型、角型のブリキ缶。食品対応の内面ラッカーとオフセット印刷に対応します。'
      }
    }
  },

  ar: {
    intro: 'اثنا عشر خط إنتاج ضمن طلب عرض سعر واحد: ورق مقوى وكرتون مضلع وأفلام مرنة وملصقات وPET وصفيح. الحد الأدنى للطلب 500 قطعة، ومخطط القص مجاناً خلال 24 ساعة.',
    tiles: {
      'custom-boxes': {
        alt: 'تشكيلة من صناديق الشحن والصناديق الصلبة المطبوعة بشعارات مطبوعة بالرقائق المعدنية',
        text: 'صناديق شحن من الكرتون المضلع وصناديق صلبة بتمويج E وB وBC، ثلاث أو خمس طبقات، مصممة لهدف 32 ECT للتصدير.'
      },
      'flexible-packaging': {
        alt: 'أكياس واقفة وأكياس ذات قاعدة مسطحة وأفلام لفائف مطبوعة لعلامات الأغذية والوجبات الخفيفة',
        text: 'أكياس واقفة مُصفّحة وأفلام لفائف مطبوعة من 90 إلى 160 ميكرون، بطبقات حاجزة معدنية أو من رقائق الألمنيوم.'
      },
      'luxury-magnetic-boxes': {
        alt: 'صناديق هدايا بإغلاق مغناطيسي مع طباعة بالرقائق الذهبية وبطانة ساتان وشريط',
        text: 'صناديق بإغلاق مغناطيسي صلبة أو قابلة للطي، بأغلفة ملفوفة وتشطيبات بالرقائق أو ناعمة الملمس مع حشوات داخلية مُفصّلة.'
      },
      'food-packaging': {
        alt: 'عبوات طعام جاهزة مطبوعة تشمل علب البرغر وأكواب البطاطس والأكواب وعلب الساندويتش وأكياس الكرافت',
        text: 'علب برغر وأكواب بطاطس وأكواب وعلب ساندويتش وأكياس تيك أواي من ورق مقاوم للدهون بطلاء صالح لملامسة الغذاء.'
      },
      'pharma-packaging': {
        alt: 'علبة دوائية وعبوة أقراص وعلبة كريم وأنبوب وقارورة بتصميم موحّد للعلامة',
        text: 'علب مطوية من ورق 300 إلى 400 غرام مع ترميز GS1 DataMatrix التسلسلي المُتحقق منه وفق ISO/IEC 15415 عند اعتماد الطباعة.'
      },
      'coffee-bags': {
        alt: 'كيس قهوة أسود بقاعدة مسطحة مزوّد بصمام تنفيس أحادي الاتجاه وسحاب ضغط',
        text: 'أكياس قهوة بقاعدة مسطحة أو بثنيات جانبية، بصمام تنفيس أحادي الاتجاه وفيلم عالي الحجب لتعبئة من 250 غراماً إلى كيلوغرام.'
      },
      'pet-food-bags': {
        alt: 'كيس واقف كبير لطعام الكلاب مطبوع بالكامل بتصميم العلامة',
        text: 'أكياس طعام حيوانات أليفة عالية التحمل من 120 إلى 180 ميكرون، بتركيبات ألمنيوم للأعلاف عالية الدهون ولحامات جانبية معززة.'
      },
      'cannabis-mylar-bags': {
        alt: 'كيس مايلر أخضر واقف للقنب بسحاب قابل لإعادة الإغلاق ولوحة وزن صافٍ',
        text: 'أكياس مايلر مانعة للرائحة بحاجز ألمنيوم، مع خيار سحاب مقاوم لعبث الأطفال ونفاذية أكسجين منخفضة جداً.'
      },
      'paper-bags': {
        alt: 'أكياس ورقية للبيع بالتجزئة بلون الكرافت والأبيض والوردي بمقابض حبلية وشرائط ساتان',
        text: 'أكياس ورقية من الكرافت أو الورق المطلي للبيع بالتجزئة والهدايا والتيك أواي، بمقابض حبلية أو شريطية أو مقصوصة.'
      },
      'labels-stickers': {
        alt: 'لفائف ملصقات مطبوعة وستيكرات مقصوصة وملصقات بأفرخ لعلامات القهوة والعناية بالبشرة والشموع',
        text: 'ملصقات لفائف ومقصوصة على الورق أو BOPP أو PET أو الهولوغرام، بلاصق دائم أو قابل للإزالة أو مخصص للتجميد.'
      },
      'pet-bottles': {
        alt: 'عبوات وقوارير PET شفافة وكهرمانية للمكملات والأقراص والمشروبات',
        text: 'قوارير وعبوات PET بدرجة غذائية من 30 مل إلى 1000 مل، بفوهات من 18/410 إلى 38 مم وأغطية مطابقة.'
      },
      'tin-boxes': {
        alt: 'علبة معدنية دائرية فضية وعلبة شاي مستطيلة خضراء وعلبة مربعة بلون الليلك لبلسم الشفاه بتفاصيل ذهبية',
        text: 'علب صفيح بمفصلات أو غطاء منزلق أو نافذة، دائرية أو مستطيلة، بطلاء داخلي صالح للغذاء وطباعة أوفست.'
      }
    }
  }
};

function escapeAttr(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeText(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Each tile is one <article class="product-card"> … </article> block. Splitting on
// the opening tag and matching the slug inside the block is more robust than one
// giant regex over the whole grid: the blocks differ between locales (extra srcset
// and sizes attributes, different attribute order) and the copy inside them is
// translated, so the slug in the href is the only thing worth keying on.
const ARTICLE = /<article class="product-card">[\s\S]*?<\/article>/g;

const stats = { filesChanged: 0, tilesRewritten: 0, altRewritten: 0, introRewritten: 0, unmatched: [] };

for (const [locale, deck] of Object.entries(COPY)) {
  const file = locale === 'en'
    ? path.join(CONTENT, 'index.html')
    : path.join(CONTENT, locale, 'index.html');
  if (!fs.existsSync(file)) { stats.unmatched.push(`${locale}: no index.html`); continue; }

  const original = fs.readFileSync(file, 'utf8');
  let html = original;
  let tilesHere = 0;
  let altHere = 0;

  html = html.replace(ARTICLE, block => {
    const href = (block.match(/<a href="([^"]+)"/) || [])[1] || '';
    const slug = SLUGS.find(item => href.includes(`/products/${item}.html`) || href.includes(`products/${item}.html`));
    if (!slug) { stats.unmatched.push(`${locale}: unrecognised tile href ${href}`); return block; }
    const copy = deck.tiles[slug];
    if (!copy) { stats.unmatched.push(`${locale}: no copy for ${slug}`); return block; }

    let updated = block;

    // The card body paragraph is the only <p> inside the article.
    const paragraphs = updated.match(/<p>[\s\S]*?<\/p>/g) || [];
    if (paragraphs.length === 1) {
      updated = updated.replace(paragraphs[0], () => `<p>${escapeText(copy.text)}</p>`);
      tilesHere += 1;
    } else {
      stats.unmatched.push(`${locale}/${slug}: expected 1 paragraph, found ${paragraphs.length}`);
    }

    // Only the <img> carries alt here; <source> elements have none.
    const before = updated;
    updated = updated.replace(/(<img\b[^>]*\balt=")([^"]*)(")/i, (_m, lead, _old, tail) => `${lead}${escapeAttr(copy.alt)}${tail}`);
    if (updated !== before) altHere += 1;
    else stats.unmatched.push(`${locale}/${slug}: no img alt found`);

    return updated;
  });

  // Section intro sentence directly under the "Shop By Category" heading.
  const introMatch = html.match(/(<div class="eyebrow">[^<]*<\/div><h2>[^<]*<\/h2><p>)([\s\S]*?)(<\/p>)/);
  if (introMatch) {
    html = html.replace(introMatch[0], () => `${introMatch[1]}${escapeText(deck.intro)}${introMatch[3]}`);
    stats.introRewritten += 1;
  } else {
    stats.unmatched.push(`${locale}: section intro paragraph not found`);
  }

  if (html !== original) {
    if (apply) fs.writeFileSync(file, html);
    stats.filesChanged += 1;
  }
  stats.tilesRewritten += tilesHere;
  stats.altRewritten += altHere;
}

console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', ...stats }, null, 2));
