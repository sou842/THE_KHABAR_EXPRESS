import { IBlog } from "@/models/blog.model";
import { buildSiteUrl } from "./site";

const BROKEN_UNSPLASH_IDS = [
  "1581092921461-7d65ca45c1c1",
  "1584697964403-1f0c8c0b5e43",
];

export const getImageUrl = (blog: IBlog) => {
  const category = blog?.category?.toLowerCase() || "default";

  const categoryImages: Record<string, string[]> = {
    technology: [
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1562408590-e32931084e23?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1597589827317-4c6d6e0a90bd?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1480694313141-fce5e697ee25?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1617042375876-a13e36732a04?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=1200&auto=format&fit=crop&q=80",
    ],
    health: [
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1493210977954-28f5c2b6ab18?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1467453678174-768ec283a940?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1554734867-bf3c00a49371?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484863137850-59afcfe05386?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1470468969717-61d5d54fd036?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1499728603263-13726abce5fd?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80",
    ],
    finance: [
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1559526324-593bc073d938?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1565514020179-026b92b2d70b?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1622186477895-f2af6a0f5a97?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1619983081563-430f63602796?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=1200&auto=format&fit=crop&q=80",
    ],
    // ... skipping other categories for brevity as they follow same pattern or I can just use a helper
    politics: [
        "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1575320181282-9afab399332c?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1607988795691-3d0147b43231?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1574169208507-84376144848b?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1509822929063-6b6723709747?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1580130775562-0ef92da028de?w=1200&auto=format&fit=crop&q=80",
    ],
    sports: [
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1526676037777-05a232554f77?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1583308153024-b8da8af6b9f8?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1434648957308-5e6a859697e8?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1519766304817-4f37bda74a26?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1541534722566-4c453e0f4949?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1576458088443-04a19bb13da6?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1540200049-99a67f5f5ece?w=1200&auto=format&fit=crop&q=80",
    ],
    travel: [
        "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1200&auto=format&fit=crop&q=80",
    ],
    food: [
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1464306208223-e0b4495a5621?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1528712306091-ed0763094c98?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1504544750208-dc0358e35284?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=1200&auto=format&fit=crop&q=80",
    ],
    default: [
        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=630&fit=crop&q=80",
        "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&h=630&fit=crop&q=80",
        "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=1200&h=630&fit=crop&q=80",
        "https://images.unsplash.com/photo-1542396601-dca920ea2807?w=1200&h=630&fit=crop&q=80",
        "https://images.unsplash.com/photo-1504465390-9c2f616a2b77?w=1200&h=630&fit=crop&q=80",
        "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1200&h=630&fit=crop&q=80",
        "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&h=630&fit=crop&q=80",
        "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=1200&h=630&fit=crop&q=80",
        "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1200&h=630&fit=crop&q=80",
        "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=1200&h=630&fit=crop&q=80",
        "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=1200&h=630&fit=crop&q=80",
        "https://images.unsplash.com/photo-1500989145603-8e7ef71d639e?w=1200&h=630&fit=crop&q=80",
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=630&fit=crop&q=80",
        "https://images.unsplash.com/photo-1523289333742-be1143f6b766?w=1200&h=630&fit=crop&q=80",
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=630&fit=crop&q=80",
        "https://images.unsplash.com/photo-1488998527040-85054a85150e?w=1200&h=630&fit=crop&q=80",
        "https://images.unsplash.com/photo-1504796126897-7c45b279f888?w=1200&h=630&fit=crop&q=80",
        "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?w=1200&h=630&fit=crop&q=80",
        "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1200&h=630&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&h=630&fit=crop&q=80",
    ],
  };

  const images = categoryImages[category] || categoryImages.default;
  const hashString = blog?.title || String(Math.random());
  const hash = hashString?.split("")?.reduce((acc: number, char: string) => acc + char?.charCodeAt(0), 0);
  const randomIndex = hash % images?.length;

  let res = blog?.thumbnail?.image;

  // Use fallback if clearly broken, contains known problematic S3 string, or is a known dead Unsplash ID
  const isS3Url = res?.includes('thekhabarexpress.s3.ap-southeast-2');
  const isBrokenUnsplash = BROKEN_UNSPLASH_IDS.some(id => res?.includes(id));
  
  if (!res || isS3Url || isBrokenUnsplash) {
    res = images[randomIndex];
  }

  // Ensure trimming
  res = res?.trim() || "";

  // Optimize Unsplash URLs if missing parameters
  if (res.includes("images.unsplash.com") && !res.includes("?")) {
    res += "?w=1200&auto=format&fit=crop&q=80";
  } else if (res.includes("images.unsplash.com") && res.includes("w=") && !res.includes("w=1200")) {
    // Replace lower resolution with 1200px
    res = res.replace(/w=\d+/, "w=1200");
  }

  return buildSiteUrl(res);
};

export const formatDate = (dateString?: Date | string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatShortDate = (dateString?: Date | string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const getRandomFallbackImage = () => {
  const images = [
    "https://images.unsplash.com/photo-1624269305548-1527ef905ff6?w=900&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1635156219587-879ded59e273?w=900&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=900&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=900&auto=format&fit=crop"
  ];
  return images[Math.floor(Math.random() * images.length)];
};
