/* Mã vùng điện thoại cho ô "Contact Number / WhatsApp" ở trang Booking.
   Mỗi dòng: "cờ|tên nước|mã gọi". Danh sách gồm các thị trường khách quốc tế
   chính và toàn bộ Đông Nam Á; Việt Nam đặt đầu danh sách cho dễ chọn. */
const rows = [
  "🇻🇳|Viet Nam|+84",
  "🇦🇺|Australia|+61",
  "🇦🇹|Austria|+43",
  "🇧🇪|Belgium|+32",
  "🇧🇩|Bangladesh|+880",
  "🇧🇷|Brazil|+55",
  "🇧🇳|Brunei|+673",
  "🇧🇬|Bulgaria|+359",
  "🇰🇭|Cambodia|+855",
  "🇨🇦|Canada|+1",
  "🇨🇱|Chile|+56",
  "🇨🇳|China|+86",
  "🇨🇴|Colombia|+57",
  "🇭🇷|Croatia|+385",
  "🇨🇿|Czechia|+420",
  "🇩🇰|Denmark|+45",
  "🇪🇬|Egypt|+20",
  "🇪🇪|Estonia|+372",
  "🇫🇮|Finland|+358",
  "🇫🇷|France|+33",
  "🇩🇪|Germany|+49",
  "🇬🇷|Greece|+30",
  "🇭🇰|Hong Kong|+852",
  "🇭🇺|Hungary|+36",
  "🇮🇸|Iceland|+354",
  "🇮🇳|India|+91",
  "🇮🇩|Indonesia|+62",
  "🇮🇪|Ireland|+353",
  "🇮🇱|Israel|+972",
  "🇮🇹|Italy|+39",
  "🇯🇵|Japan|+81",
  "🇯🇴|Jordan|+962",
  "🇰🇿|Kazakhstan|+7",
  "🇰🇼|Kuwait|+965",
  "🇱🇦|Laos|+856",
  "🇱🇻|Latvia|+371",
  "🇱🇧|Lebanon|+961",
  "🇱🇹|Lithuania|+370",
  "🇱🇺|Luxembourg|+352",
  "🇲🇴|Macao|+853",
  "🇲🇾|Malaysia|+60",
  "🇲🇻|Maldives|+960",
  "🇲🇽|Mexico|+52",
  "🇲🇳|Mongolia|+976",
  "🇲🇲|Myanmar|+95",
  "🇳🇵|Nepal|+977",
  "🇳🇱|Netherlands|+31",
  "🇳🇿|New Zealand|+64",
  "🇳🇴|Norway|+47",
  "🇴🇲|Oman|+968",
  "🇵🇰|Pakistan|+92",
  "🇵🇭|Philippines|+63",
  "🇵🇱|Poland|+48",
  "🇵🇹|Portugal|+351",
  "🇶🇦|Qatar|+974",
  "🇷🇴|Romania|+40",
  "🇷🇺|Russia|+7",
  "🇸🇦|Saudi Arabia|+966",
  "🇷🇸|Serbia|+381",
  "🇸🇬|Singapore|+65",
  "🇸🇰|Slovakia|+421",
  "🇸🇮|Slovenia|+386",
  "🇿🇦|South Africa|+27",
  "🇰🇷|South Korea|+82",
  "🇪🇸|Spain|+34",
  "🇱🇰|Sri Lanka|+94",
  "🇸🇪|Sweden|+46",
  "🇨🇭|Switzerland|+41",
  "🇹🇼|Taiwan|+886",
  "🇹🇭|Thailand|+66",
  "🇹🇷|Türkiye|+90",
  "🇺🇦|Ukraine|+380",
  "🇦🇪|United Arab Emirates|+971",
  "🇬🇧|United Kingdom|+44",
  "🇺🇸|United States|+1",
  "🇺🇿|Uzbekistan|+998",
];

/* Windows không có glyph cho emoji cờ nên chữ cờ hiện ra thành "VN", "AU"…
   Vì vậy lấy mã ISO 2 chữ từ emoji để dùng ảnh cờ thật. */
const isoFromFlag = (flag) =>
  Array.from(flag)
    .map((char) => String.fromCharCode(char.codePointAt(0) - 0x1f1e6 + 65))
    .join("")
    .toLowerCase();

export const dialCodes = rows.map((row) => {
  const [flag, country, code] = row.split("|");
  return { flag, country, code, iso: isoFromFlag(flag) };
});
