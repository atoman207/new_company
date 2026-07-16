// サンプルデータ投入スクリプト
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // SEED_RESET=1 を指定した場合のみ既存データを削除（依存順）
  if (process.env.SEED_RESET === "1") {
    await prisma.comment.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.review.deleteMany();
    await prisma.store.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  } else {
    const existing = await prisma.category.count();
    if (existing > 0) {
      console.log(
        "既にデータが存在するためスキップしました。上書きする場合は SEED_RESET=1 を指定して実行してください。"
      );
      return;
    }
  }

  // ---------------- カテゴリ ----------------
  const categoryData = [
    { name: "グルメ", slug: "gourmet", sortOrder: 1 },
    { name: "カフェ", slug: "cafe", sortOrder: 2 },
    { name: "美容・サロン", slug: "beauty", sortOrder: 3 },
    { name: "ショッピング", slug: "shopping", sortOrder: 4 },
    { name: "レジャー・娯楽", slug: "leisure", sortOrder: 5 },
    { name: "健康・リラクゼーション", slug: "health", sortOrder: 6 },
  ];
  const categories = {};
  for (const c of categoryData) {
    categories[c.slug] = await prisma.category.create({ data: c });
  }

  // ---------------- ユーザー ----------------
  const adminHash = await bcrypt.hash("admin1234", 10);
  const userHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "運営管理者",
      email: "admin@example.com",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  const userData = [
    { name: "グルメ太郎", email: "taro@example.com" },
    { name: "はなこ", email: "hanako@example.com" },
    { name: "けんじ", email: "kenji@example.com" },
    { name: "ゆきんこ", email: "yuki@example.com" },
    { name: "みお", email: "mio@example.com" },
  ];
  const users = [];
  for (const u of userData) {
    users.push(
      await prisma.user.create({
        data: { ...u, passwordHash: userHash, role: "USER" },
      })
    );
  }
  const [taro, hanako, kenji, yuki, mio] = users;

  // ---------------- 店舗 ----------------
  const img = (slug) => [
    `/images/stores/${slug}-1.svg`,
    `/images/stores/${slug}-2.svg`,
    `/images/stores/${slug}-3.svg`,
  ];

  const storeData = [
    {
      name: "炭火焼鳥 とり吉 渋谷本店",
      category: "gourmet",
      area: "東京・渋谷",
      address: "東京都渋谷区道玄坂2-10-12 新大宗ビル1F",
      phone: "03-1234-5678",
      businessHours: "17:00〜23:30（L.O. 23:00）",
      closedDays: "毎週月曜日",
      budget: "3,000円〜4,000円",
      access: "JR渋谷駅ハチ公口から徒歩5分",
      website: "https://example.com/torikichi",
      description:
        "備長炭でじっくり焼き上げる焼鳥が自慢の老舗焼鳥店です。朝引きの新鮮な国産鶏のみを使用し、名物の「つくね」は毎日手ごねで仕込んでいます。日本酒・焼酎の品揃えも豊富で、仕事帰りの一杯にもぴったり。カウンター席では職人の焼きの技を眺めながらお食事をお楽しみいただけます。",
    },
    {
      name: "鮨処 いさ美",
      category: "gourmet",
      area: "東京・銀座",
      address: "東京都中央区銀座6-4-8 曽根ビルB1F",
      phone: "03-2345-6789",
      businessHours: "昼 11:30〜14:00／夜 17:00〜22:00",
      closedDays: "日曜・祝日",
      budget: "昼 5,000円〜／夜 15,000円〜",
      access: "東京メトロ銀座駅A2出口から徒歩3分",
      website: null,
      description:
        "豊洲市場から毎朝仕入れる旬の魚介を、熟練の職人が一貫ずつ丁寧に握る江戸前鮨の店です。シャリには赤酢をブレンドし、ネタごとに最適な仕事を施しています。落ち着いた店内はカウンター8席のみ。記念日や大切な接待にもご利用いただけます。昼のおまかせコースはお得と評判です。",
    },
    {
      name: "麺屋 白樺",
      category: "gourmet",
      area: "札幌",
      address: "北海道札幌市中央区南3条西4丁目 アルシュビル1F",
      phone: "011-345-6789",
      businessHours: "11:00〜21:00（スープがなくなり次第終了）",
      closedDays: "不定休",
      budget: "900円〜1,200円",
      access: "地下鉄すすきの駅から徒歩3分",
      website: "https://example.com/shirakaba",
      description:
        "札幌味噌ラーメンの王道を守り続ける人気店。北海道産の味噌を3種類ブレンドした濃厚スープに、中太ちぢれ麺がよく絡みます。トッピングの炙りチャーシューと北海道産バターが絶品。行列必至ですが回転は早めです。夏季限定の「冷やし味噌らーめん」も人気メニューのひとつ。",
    },
    {
      name: "イタリアン食堂 ヴェンティ",
      category: "gourmet",
      area: "横浜",
      address: "神奈川県横浜市中区元町1-13-2 元町プラザ2F",
      phone: "045-456-7890",
      businessHours: "ランチ 11:30〜15:00／ディナー 17:30〜22:30",
      closedDays: "毎週水曜日",
      budget: "ランチ 1,500円〜／ディナー 4,000円〜",
      access: "みなとみらい線元町・中華街駅から徒歩4分",
      website: "https://example.com/venti",
      description:
        "気取らず楽しめる下町イタリアンがコンセプト。薪窯で焼き上げる本格ナポリピッツァと、神奈川県産野菜をふんだんに使った前菜が自慢です。ソムリエ厳選のイタリアワインはグラス600円から。テラス席はペット同伴OKで、週末はご家族連れで賑わいます。",
    },
    {
      name: "自家焙煎珈琲 森の音",
      category: "cafe",
      area: "京都",
      address: "京都府京都市左京区銀閣寺町42-3",
      phone: "075-567-8901",
      businessHours: "9:00〜18:00（L.O. 17:30）",
      closedDays: "毎週火曜日",
      budget: "800円〜1,500円",
      access: "市バス「銀閣寺道」から徒歩5分",
      website: "https://example.com/morinone",
      description:
        "哲学の道のほど近く、築90年の京町家を改装した自家焙煎コーヒーの専門店です。世界各国から仕入れたスペシャルティコーヒー豆を、店内の焙煎機で毎朝丁寧に焙煎しています。名物は炭火焙煎の「森の音ブレンド」と、京都の老舗和菓子店とコラボした季節の和スイーツ。中庭を眺めながら、静かなひとときをお過ごしください。",
    },
    {
      name: "パンケーキカフェ ふわり",
      category: "cafe",
      area: "東京・新宿",
      address: "東京都新宿区新宿3-17-5 カワセビル4F",
      phone: "03-3456-7890",
      businessHours: "10:00〜20:00（L.O. 19:00）",
      closedDays: "年中無休",
      budget: "1,200円〜1,800円",
      access: "JR新宿駅東口から徒歩3分",
      website: "https://example.com/fuwari",
      description:
        "口に入れた瞬間とろける「スフレパンケーキ」の専門店。注文を受けてから一枚一枚じっくり焼き上げるため少しお時間をいただきますが、その分ふわふわの食感は格別です。季節のフルーツをたっぷり使った限定メニューはSNSでも話題。休日は整理券制となりますので、お早めのご来店がおすすめです。",
    },
    {
      name: "ブックカフェ 灯火",
      category: "cafe",
      area: "名古屋",
      address: "愛知県名古屋市中区大須3-30-8 万松寺ビル2F",
      phone: "052-678-9012",
      businessHours: "11:00〜22:00",
      closedDays: "毎月第3木曜日",
      budget: "600円〜1,200円",
      access: "地下鉄上前津駅から徒歩4分",
      website: null,
      description:
        "約3,000冊の蔵書に囲まれてゆったり過ごせるブックカフェです。文学からアート、旅行記まで幅広いジャンルを取り揃え、購入前の本も自由に読みながらコーヒーをお楽しみいただけます。深煎りのハンドドリップコーヒーと、自家製の焼き菓子が好評。電源・Wi-Fi完備で、読書会などのイベントも定期開催しています。",
    },
    {
      name: "ヘアサロン LUMIE 渋谷",
      category: "beauty",
      area: "東京・渋谷",
      address: "東京都渋谷区神南1-15-3 パールビル3F",
      phone: "03-4567-8901",
      businessHours: "平日 11:00〜21:00／土日祝 10:00〜19:00",
      closedDays: "毎週火曜日",
      budget: "カット 5,500円〜／カラー 8,800円〜",
      access: "JR渋谷駅から徒歩7分",
      website: "https://example.com/lumie",
      description:
        "「なりたい自分に出会えるサロン」をコンセプトに、丁寧なカウンセリングで一人ひとりに似合うスタイルをご提案します。ダメージを最小限に抑えるオーガニックカラーと、髪質改善トリートメントが人気メニュー。完全予約制でお待たせしません。初回のお客様は全メニュー20%OFFの特典があります。",
    },
    {
      name: "ネイル＆アイラッシュ Coco",
      category: "beauty",
      area: "大阪・難波",
      address: "大阪府大阪市中央区難波3-7-12 GEEビル5F",
      phone: "06-5678-9012",
      businessHours: "10:00〜20:00（最終受付 18:30）",
      closedDays: "不定休",
      budget: "ネイル 6,000円〜／マツエク 5,000円〜",
      access: "地下鉄なんば駅から徒歩2分",
      website: "https://example.com/coco",
      description:
        "ネイルとまつげエクステが同時に施術できるトータルビューティーサロンです。経験豊富なネイリストが、爪の健康を第一に考えた施術を行います。シンプルなワンカラーから話題のニュアンスネイルまで、デザインは500種類以上。お仕事帰りにも通いやすい駅近立地で、リピーター様多数の人気店です。",
    },
    {
      name: "暮らしの雑貨 みなとや",
      category: "shopping",
      area: "横浜",
      address: "神奈川県横浜市中区馬車道4-5-1",
      phone: "045-789-0123",
      businessHours: "11:00〜19:00",
      closedDays: "毎週月曜日（祝日の場合は翌日）",
      budget: "500円〜5,000円",
      access: "みなとみらい線馬車道駅から徒歩1分",
      website: "https://example.com/minatoya",
      description:
        "「毎日の暮らしを少し豊かに」をテーマに、全国の作家さんの器や生活雑貨を集めたセレクトショップです。波佐見焼や美濃焼などの和食器から、北欧テイストのキッチン用品まで、店主が実際に使って選んだものだけを並べています。贈り物のラッピングも無料で承ります。季節ごとの企画展も開催中。",
    },
    {
      name: "古着屋 レトロポップ",
      category: "shopping",
      area: "東京・新宿",
      address: "東京都新宿区高田馬場2-14-6 山田ビル1F",
      phone: "03-6789-0123",
      businessHours: "12:00〜20:00",
      closedDays: "年中無休",
      budget: "1,000円〜10,000円",
      access: "JR高田馬場駅から徒歩5分",
      website: null,
      description:
        "70〜90年代のアメリカ・ヨーロッパ古着を中心に、状態の良いヴィンテージアイテムを取り揃えています。バイヤーが現地で直接買い付けるため、他では出会えない一点物ばかり。デニムやミリタリージャケットの品揃えは都内屈指です。毎月第1土曜日は新入荷アイテムが一斉に並ぶ「入荷祭」を開催しています。",
    },
    {
      name: "スターレーンボウル 名古屋",
      category: "leisure",
      area: "名古屋",
      address: "愛知県名古屋市中村区名駅4-10-25 IMAIビル6F",
      phone: "052-890-1234",
      businessHours: "10:00〜24:00（金土は翌2:00まで）",
      closedDays: "年中無休",
      budget: "1ゲーム 600円〜（貸靴 350円）",
      access: "JR名古屋駅から徒歩5分",
      website: "https://example.com/starlane",
      description:
        "全24レーンの大型ボウリング場です。最新のスコアシステムとムーンライト演出で、お子様から大人まで楽しめます。ダーツ・ビリヤード・カラオケも併設しており、貸切パーティープランも人気。毎週水曜日は「レディースデー」でゲーム料金が半額になります。投げ放題パックもお得です。",
    },
    {
      name: "天然温泉 ゆらり湯",
      category: "leisure",
      area: "福岡",
      address: "福岡県福岡市博多区住吉4-1-27",
      phone: "092-901-2345",
      businessHours: "6:00〜翌1:00（最終受付 24:00）",
      closedDays: "毎月第2火曜日",
      budget: "大人 850円／小人 400円",
      access: "JR博多駅から無料シャトルバスで10分",
      website: "https://example.com/yurariyu",
      description:
        "地下800メートルから湧き出る天然温泉が自慢の日帰り温泉施設です。露天風呂・炭酸泉・サウナなど10種類のお風呂をお楽しみいただけます。泉質はナトリウム塩化物泉で、湯冷めしにくく「あたたまりの湯」として親しまれています。お食事処では博多名物のもつ鍋も味わえます。岩盤浴とセットのお得なプランもございます。",
    },
    {
      name: "リラクゼーションサロン 凪",
      category: "health",
      area: "東京・銀座",
      address: "東京都中央区銀座2-8-15 銀座ハビウル5F",
      phone: "03-7890-1234",
      businessHours: "11:00〜22:00（最終受付 21:00）",
      closedDays: "年中無休",
      budget: "60分 7,000円〜",
      access: "東京メトロ銀座一丁目駅から徒歩2分",
      website: "https://example.com/nagi",
      description:
        "都会の喧騒を忘れられる、和モダンな空間のリラクゼーションサロンです。国家資格を持つセラピストによるオーダーメイドの施術で、肩こり・腰痛・眼精疲労など一人ひとりのお悩みにアプローチします。アロマオイルは6種類からお選びいただけます。施術後はハーブティーのサービスも。仕事帰りのリフレッシュにどうぞ。",
    },
    {
      name: "フィットネスジム BEAT24 梅田",
      category: "health",
      area: "大阪・梅田",
      address: "大阪府大阪市北区茶屋町2-19 JPビル3F",
      phone: "06-8901-2345",
      businessHours: "24時間営業",
      closedDays: "年中無休（メンテナンス日を除く）",
      budget: "月額 7,980円（税込）",
      access: "阪急梅田駅から徒歩3分",
      website: "https://example.com/beat24",
      description:
        "24時間365日いつでも通える都市型フィットネスジムです。最新のマシンを50台以上完備し、初心者の方にはスタッフが無料でトレーニングメニューを作成します。シャワールーム・ロッカー完備で、お仕事前後のトレーニングにも便利。パーソナルトレーニングやオンラインレッスンなどオプションも充実しています。",
    },
  ];

  const stores = [];
  for (const s of storeData) {
    const { category, ...rest } = s;
    stores.push(
      await prisma.store.create({
        data: {
          ...rest,
          images: img(category),
          categoryId: categories[category].id,
          published: true,
        },
      })
    );
  }

  // ---------------- 口コミ ----------------
  // stores 配列の並びは storeData と同じ
  const [
    torikichi, isami, shirakaba, venti, morinone, fuwari, tomoshibi,
    lumie, coco, minatoya, retropop, starlane, yurariyu, nagi, beat24,
  ] = stores;

  const reviewData = [
    // とり吉
    { store: torikichi, user: taro, rating: 5, title: "つくねが絶品！何度でも通いたくなる名店", body: "会社の同僚と訪問しました。名物のつくねは外は香ばしく中はふんわりで、今まで食べた焼鳥の中でも間違いなくトップクラスです。日本酒の品揃えも豊富で、店員さんがおすすめを丁寧に教えてくれました。カウンター席で職人さんの手さばきを見ながら飲むお酒は最高でした。" },
    { store: torikichi, user: hanako, rating: 4, title: "雰囲気も味も良いお店です", body: "金曜の夜に予約して行きました。備長炭の香りがふわっと広がる店内で、どの串も丁寧に焼かれていて美味しかったです。少し混んでいて提供に時間がかかったので星4つですが、また行きたいと思えるお店でした。レバーが苦手な私でも食べられたのには驚きです。" },
    { store: torikichi, user: kenji, rating: 4, title: "仕事帰りの一杯に最高", body: "渋谷駅から近くて便利です。焼鳥はもちろん、お通しの鶏スープから美味しい。ハイボールとの相性が抜群でした。月曜定休なのだけ注意が必要です。" },
    // いさ美
    { store: isami, user: yuki, rating: 5, title: "記念日に利用しました。忘れられない味です", body: "結婚記念日に夜のおまかせコースをいただきました。大将の握る鮨はどれも美しく、特にのどぐろの炙りは口の中でとろけました。赤酢のシャリも初体験でしたが、ネタとの一体感が素晴らしかったです。決して安くはないですが、それだけの価値がある特別なお店だと思います。" },
    { store: isami, user: taro, rating: 5, title: "昼のおまかせはコスパ最強", body: "ランチで訪問。この内容で5,000円は銀座では破格だと思います。ネタの質はもちろん、椀物まで手を抜かない仕事ぶりに感動しました。カウンター8席のみなので予約は必須です。" },
    { store: isami, user: mio, rating: 4, title: "大将の人柄も含めて素敵なお店", body: "少し緊張して入りましたが、大将が気さくに話しかけてくださり、リラックスして楽しめました。旬の魚の説明も勉強になります。予約が取りにくいのが唯一の難点でしょうか。" },
    // 白樺
    { store: shirakaba, user: kenji, rating: 5, title: "札幌出張の楽しみはこの一杯", body: "出張のたびに必ず寄っています。3種ブレンドの味噌スープは濃厚なのに後味がすっきりしていて、最後の一滴まで飲み干してしまいます。炙りチャーシューとバターの組み合わせは反則級の美味しさ。行列ができていますが回転が早いので見た目ほど待ちません。" },
    { store: shirakaba, user: hanako, rating: 4, title: "並んででも食べたい味噌ラーメン", body: "旅行中に立ち寄りました。寒い日だったので温まる味噌ラーメンが染みました。ちぢれ麺がスープをよく持ち上げてくれます。平日でも30分ほど並んだので、時間に余裕を持って行くのがおすすめです。" },
    { store: shirakaba, user: yuki, rating: 3, title: "美味しいけれど並ぶのが大変", body: "味は確かに美味しいです。ただ真冬に外で40分待つのはなかなか堪えました…。スープがなくなり次第終了なので、遅い時間に行くと売り切れのリスクもあります。平日の開店直後が狙い目だと思います。" },
    // ヴェンティ
    { store: venti, user: mio, rating: 5, title: "薪窯ピッツァが本格的！", body: "マルゲリータを注文しましたが、縁はもちもち、中はしっとりの本格ナポリピッツァでした。前菜の盛り合わせも地元野菜がたっぷりで彩りが綺麗。グラスワインが600円からというのも嬉しいポイントです。テラス席で愛犬と一緒にランチできるのも最高でした。" },
    { store: venti, user: taro, rating: 4, title: "家族で気軽に楽しめるイタリアン", body: "子連れで日曜のランチに伺いました。店員さんが子どもに優しく対応してくださり助かりました。パスタもピッツァも美味しく、ボリュームも十分。週末は混むので予約がおすすめです。" },
    // 森の音
    { store: morinone, user: hanako, rating: 5, title: "京都らしい落ち着いた空間で最高のコーヒーを", body: "哲学の道を散歩した後に立ち寄りました。町家を改装した店内は静かで、中庭の緑を眺めながらいただく森の音ブレンドは格別でした。和スイーツとのセットもおすすめです。観光の喧騒を忘れられる、大人の隠れ家のようなカフェです。" },
    { store: morinone, user: yuki, rating: 5, title: "コーヒー好きなら必訪のお店", body: "自家焙煎の豆が10種類以上あり、店主さんが好みを聞いて丁寧に選んでくれました。ハンドドリップの所作も美しく、香りから楽しめます。豆の購入もできるので、お土産にもぴったりです。" },
    { store: morinone, user: kenji, rating: 4, title: "観光の合間の休憩に", body: "銀閣寺の帰りに寄りました。少し場所がわかりにくいですが、その分落ち着けます。コーヒーは酸味と苦味のバランスが良く美味しかったです。人気店なので昼過ぎは少し待ちました。" },
    // ふわり
    { store: fuwari, user: mio, rating: 4, title: "ふわっふわのパンケーキに感動", body: "話題のスフレパンケーキをようやく食べられました。ナイフを入れた瞬間の柔らかさに驚き。口の中でしゅわっと溶けます。焼き上がりまで20分ほど待ちますが、その価値は十分あります。季節限定のいちごメニューも美味しそうだったので、また行きたいです。" },
    { store: fuwari, user: hanako, rating: 4, title: "女子会にぴったり", body: "友人と3人で利用しました。見た目が可愛くて写真映えします。甘さ控えめなので男性でも食べやすいと思います。休日は整理券制なので、開店前に行くのがおすすめです。" },
    // 灯火
    { store: tomoshibi, user: kenji, rating: 5, title: "時間を忘れて読書に没頭できる", body: "本好きにはたまらない空間です。気になっていた本を読みながら、深煎りコーヒーをゆっくり味わえました。電源とWi-Fiもあるので、作業にも使えます。スタッフさんの本のセレクトが素晴らしく、新しいジャンルとの出会いもありました。" },
    { store: tomoshibi, user: yuki, rating: 4, title: "自家製スコーンが美味しい", body: "読書目的で訪問しましたが、フードメニューのレベルが高くて驚きました。特にスコーンはさくさくで、コーヒーとの相性抜群。夜遅くまで営業しているのもありがたいです。" },
    // LUMIE
    { store: lumie, user: mio, rating: 5, title: "理想の髪型にしてもらえました", body: "初めて利用しましたが、カウンセリングがとても丁寧で、なりたいイメージをしっかり汲み取ってくれました。髪質改善トリートメントの効果もすごくて、ツヤツヤの仕上がりに大満足です。初回20%OFFもお得でした。次回の予約もその場で入れました！" },
    { store: lumie, user: hanako, rating: 4, title: "オーガニックカラーで髪に優しい", body: "カラーの持ちが良く、ダメージも少なくて気に入っています。スタイリストさんの提案力が高く、毎回おまかせでお願いしています。人気店なので土日の予約は早めが必須です。" },
    // Coco
    { store: coco, user: yuki, rating: 5, title: "ネイルとマツエクが一度にできて時短！", body: "仕事が忙しくてなかなかサロンに行く時間がなかったのですが、こちらはネイルとまつげエクステを同時に施術してもらえるので本当に助かります。仕上がりも丁寧で、ニュアンスネイルのデザインが可愛すぎました。担当の方のセンスを信頼しています。" },
    { store: coco, user: mio, rating: 4, title: "駅近で通いやすいサロン", body: "なんば駅から徒歩2分という立地が最高です。技術も確かで、3週間経ってもネイルが欠けません。デザインの種類が豊富で毎回選ぶのが楽しみです。" },
    // みなとや
    { store: minatoya, user: hanako, rating: 5, title: "贈り物選びはいつもここで", body: "作家さんの器がとにかく素敵で、見ているだけで幸せな気持ちになります。友人の結婚祝いに波佐見焼のペアプレートを購入しました。無料のラッピングもセンスが良く、大変喜ばれました。店主さんの商品への愛情が伝わる、温かいお店です。" },
    { store: minatoya, user: taro, rating: 4, title: "一点物との出会いが楽しい", body: "ふらっと立ち寄りましたが、気づけば1時間近く滞在していました。手頃な価格の小皿から作家物の一点物まで幅広く、自分用に湯呑みを購入。馬車道駅からすぐなのでアクセスも良好です。" },
    // レトロポップ
    { store: retropop, user: kenji, rating: 4, title: "ヴィンテージデニムの宝庫", body: "デニム好きなら一度は行くべき店です。状態の良い90年代のリーバイスが豊富で、サイズ展開も幅広い。店員さんの知識も豊富で、年代の見分け方など色々教えてもらいました。入荷祭の日は開店前から並ぶ価値があります。" },
    { store: retropop, user: mio, rating: 4, title: "掘り出し物がたくさん", body: "古着初心者でも入りやすい雰囲気のお店です。ミリタリージャケットを5,000円でゲットできて大満足。商品の回転が早いので、こまめにチェックするのがおすすめです。" },
    // スターレーン
    { store: starlane, user: taro, rating: 4, title: "会社のイベントで貸切利用しました", body: "部署の懇親会で貸切プランを利用しました。幹事への対応が丁寧で、進行もスムーズ。最新のスコアシステムは演出が凝っていて盛り上がりました。ダーツやビリヤードもあるので、ボウリングに飽きても楽しめます。駅近なのも集合しやすくて良かったです。" },
    { store: starlane, user: yuki, rating: 3, title: "楽しいけど週末は混雑", body: "土曜の夜に行ったら1時間待ちでした…。レーン自体は綺麗で楽しめましたが、待ち時間を考えると平日がおすすめです。水曜のレディースデーはお得なのでまた利用したいです。" },
    // ゆらり湯
    { store: yurariyu, user: kenji, rating: 5, title: "博多駅近くでこの泉質は貴重", body: "出張の疲れを癒しに行きました。無料シャトルバスがあるのでアクセスも楽です。炭酸泉にゆっくり浸かった後のサウナ→水風呂→外気浴のループが最高でした。食事処のもつ鍋も本格的で、温泉と食事だけで大満足の休日になりました。" },
    { store: yurariyu, user: hanako, rating: 4, title: "岩盤浴セットがお得", body: "女友達と岩盤浴セットプランを利用しました。露天風呂は開放感があり、夜は星空も見えて癒されました。ドライヤーがもう少し新しいと嬉しいですが、この料金なら十分すぎる内容です。" },
    // 凪
    { store: nagi, user: mio, rating: 5, title: "極上の癒し空間でした", body: "デスクワークで限界だった肩こりが、60分の施術でびっくりするほど軽くなりました。国家資格を持つセラピストさんの技術は確かで、力加減も絶妙。和モダンな内装とアロマの香りで、施術中に何度も寝落ちしそうになりました。施術後のハーブティーまで含めて完璧です。" },
    { store: nagi, user: taro, rating: 5, title: "接待帰りに定期的に通っています", body: "銀座で仕事の付き合いが多いので、月2回ペースで利用しています。毎回体の状態を確認してから施術内容を調整してくれるのがありがたい。22時まで営業しているのも社会人には嬉しいポイントです。" },
    { store: nagi, user: yuki, rating: 4, title: "自分へのご褒美に", body: "頑張った月の自分へのご褒美として利用しています。アロマの種類が選べるのが楽しく、毎回違う香りを試しています。銀座価格ではありますが、技術と空間を考えれば納得です。" },
    // BEAT24
    { store: beat24, user: kenji, rating: 4, title: "24時間営業がとにかく便利", body: "仕事の時間が不規則なので、深夜でも通えるのが最大の魅力です。マシンの台数が多く、混雑時でも待ち時間はほぼありません。スタッフさんに作ってもらったメニューのおかげで、3ヶ月で体重が4kg落ちました。シャワールームが綺麗なのも良いです。" },
    { store: beat24, user: taro, rating: 3, title: "設備は良いが夕方は混む", body: "マシンは最新で申し分ないのですが、平日の19時前後はかなり混雑します。人気のパワーラックは順番待ちになることも。時間をずらせる人なら快適に使えると思います。月額料金は梅田エリアでは良心的です。" },
  ];

  const reviews = [];
  for (const r of reviewData) {
    reviews.push(
      await prisma.review.create({
        data: {
          rating: r.rating,
          title: r.title,
          body: r.body,
          userId: r.user.id,
          storeId: r.store.id,
        },
      })
    );
  }

  // ---------------- コメント ----------------
  const commentData = [
    { review: reviews[0], user: hanako, body: "つくね、私も大好きです！次はレバーも試してみてください。" },
    { review: reviews[0], user: mio, body: "この口コミを見て行ってきました。本当に美味しかったです！" },
    { review: reviews[3], user: hanako, body: "記念日利用、素敵ですね。私も誕生日に予約してみます。" },
    { review: reviews[6], user: taro, body: "出張のたびに寄るの、わかります。あのスープは癖になりますよね。" },
    { review: reviews[10], user: mio, body: "町家カフェ、雰囲気ありますよね。和スイーツも美味しかったです。" },
    { review: reviews[17], user: yuki, body: "トリートメントの効果、私も実感しました！おすすめです。" },
    { review: reviews[21], user: mio, body: "ラッピングのセンス、本当に素敵ですよね。私もプレゼントはここで選んでいます。" },
    { review: reviews[27], user: taro, body: "サウナループ最高ですよね。今度もつ鍋も食べてみます。" },
    { review: reviews[29], user: hanako, body: "寝落ちしそうになるの、わかりすぎます（笑）" },
  ];

  for (const c of commentData) {
    await prisma.comment.create({
      data: {
        body: c.body,
        userId: c.user.id,
        reviewId: c.review.id,
      },
    });
  }

  // ---------------- お気に入り ----------------
  const favoriteData = [
    { user: taro, store: torikichi },
    { user: taro, store: isami },
    { user: taro, store: nagi },
    { user: hanako, store: morinone },
    { user: hanako, store: minatoya },
    { user: hanako, store: torikichi },
    { user: kenji, store: shirakaba },
    { user: kenji, store: yurariyu },
    { user: kenji, store: beat24 },
    { user: yuki, store: coco },
    { user: yuki, store: isami },
    { user: mio, store: lumie },
    { user: mio, store: venti },
    { user: mio, store: nagi },
  ];

  for (const f of favoriteData) {
    await prisma.favorite.create({
      data: { userId: f.user.id, storeId: f.store.id },
    });
  }

  console.log("✅ シード完了:");
  console.log(`  カテゴリ: ${Object.keys(categories).length}件`);
  console.log(`  ユーザー: ${users.length + 1}名（管理者含む）`);
  console.log(`  店舗: ${stores.length}件`);
  console.log(`  口コミ: ${reviews.length}件`);
  console.log(`  コメント: ${commentData.length}件`);
  console.log(`  お気に入り: ${favoriteData.length}件`);
  console.log("");
  console.log("  管理者ログイン: admin@example.com / admin1234");
  console.log("  一般ユーザー例: taro@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
