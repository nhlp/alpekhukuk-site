import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function toSlug(value: string) {
  return slugify(value, { lower: true, strict: true, trim: true, locale: "tr" });
}

const practiceAreas = [
  {
    name: "Aile Hukuku",
    icon: "heart",
    order: 0,
    shortDescription:
      "Boşanma, velayet, nafaka ve mal paylaşımı süreçlerinde müvekkillerimizin hak ve menfaatlerini koruyoruz.",
    content:
      "<p>Aile hukuku alanında; anlaşmalı ve çekişmeli boşanma davaları, velayet ve kişisel ilişki tesisi, nafaka (tedbir, iştirak, yoksulluk) talepleri, mal rejimi ve mal paylaşımı uyuşmazlıkları ile evlat edinme süreçlerinde danışmanlık ve dava takibi hizmeti sunmaktayız.</p><p>Her aile hukuku dosyasının hassasiyetinin farkında olarak, müvekkillerimize sürecin her aşamasında empatik ve çözüm odaklı bir yaklaşımla eşlik ediyoruz.</p>",
  },
  {
    name: "İş Hukuku",
    icon: "briefcase",
    order: 1,
    shortDescription:
      "İşe iade, kıdem-ihbar tazminatı ve iş sözleşmesi uyuşmazlıklarında işçi ve işveren tarafına danışmanlık veriyoruz.",
    content:
      "<p>İş hukuku kapsamında; haksız fesih ve işe iade davaları, kıdem ve ihbar tazminatı alacakları, fazla mesai ve diğer işçilik alacakları, iş sözleşmelerinin hazırlanması ve iş sağlığı-güvenliği uyuşmazlıkları konularında hem işçi hem de işveren tarafına hukuki destek sağlıyoruz.</p><p>Dava öncesi zorunlu arabuluculuk süreçlerinde de müvekkillerimizi temsil etmekteyiz.</p>",
  },
  {
    name: "Ticaret Hukuku",
    icon: "landmark",
    order: 2,
    shortDescription:
      "Ticari sözleşmelerin hazırlanmasından icra takibine kadar şirketlerin hukuki süreçlerini yönetiyoruz.",
    content:
      "<p>Ticaret hukuku alanında; ticari sözleşmelerin hazırlanması ve incelenmesi, şirketler hukuku danışmanlığı, ticari alacakların takibi ve icra süreçleri, ortaklık ve pay devri uyuşmazlıkları ile ticari dava ve tahkim süreçlerinde hizmet vermekteyiz.</p>",
  },
  {
    name: "Ceza Hukuku",
    icon: "gavel",
    order: 3,
    shortDescription:
      "Soruşturma ve kovuşturma aşamalarında şüpheli, sanık ve mağdur vekilliği hizmeti sunuyoruz.",
    content:
      "<p>Ceza hukuku alanında; soruşturma aşamasında şüpheli müdafiliği, kovuşturma aşamasında sanık müdafiliği ve mağdur/katılan vekilliği hizmetleri sunmaktayız. Ceza yargılamasının her aşamasında müvekkillerimizin savunma hakkını etkin şekilde kullanmasını sağlıyoruz.</p>",
  },
  {
    name: "İcra ve İflas Hukuku",
    icon: "banknote",
    order: 4,
    shortDescription:
      "Alacakların takibi, icra takiplerine itiraz ve iflas süreçlerinde etkin hukuki destek sağlıyoruz.",
    content:
      "<p>İcra ve iflas hukuku kapsamında; ilamlı ve ilamsız icra takipleri, takibe itiraz ve itirazın iptali/kaldırılması davaları, haciz ve satış işlemleri, konkordato ve iflas süreçlerinde müvekkillerimize danışmanlık ve dava takibi hizmeti sunmaktayız.</p>",
  },
  {
    name: "KVKK ve Sözleşmeler Hukuku",
    icon: "shield",
    order: 5,
    shortDescription:
      "Kişisel verilerin korunması uyum süreçleri ve her türlü sözleşmenin hazırlanmasında danışmanlık veriyoruz.",
    content:
      "<p>KVKK kapsamında; veri sorumlusu ve veri işleyen yükümlülüklerine uyum süreçleri, aydınlatma metni ve açık rıza formlarının hazırlanması, veri ihlali süreç yönetimi konularında danışmanlık sunmaktayız. Ayrıca gizlilik sözleşmeleri, hizmet sözleşmeleri ve her türlü ticari/bireysel sözleşmenin hazırlanması ve incelenmesi hizmeti vermekteyiz.</p>",
  },
];

const lawyers = [
  {
    name: "Bengisu Kaya Pehlivan",
    title: "Av.",
    email: "bengisu@alpekhukuk.com.tr",
    role: "LAWYER" as const,
    bio: "Aile hukuku ve iş hukuku alanlarında, müvekkillerine dava öncesi danışmanlıktan dava sürecinin sonuna kadar titiz ve şeffaf bir yaklaşımla eşlik etmektedir.",
    order: 0,
  },
  {
    name: "Kürşat Alan",
    title: "Av.",
    email: "kursat@alpekhukuk.com.tr",
    role: "LAWYER" as const,
    bio: "Ticaret hukuku, icra-iflas hukuku ve ceza hukuku alanlarında dava ve danışmanlık hizmeti sunmaktadır.",
    order: 1,
  },
  {
    name: "Y. Kadir Pehlivan",
    title: "Av.",
    email: "kadir@alpekhukuk.com.tr",
    role: "ADMIN" as const,
    bio: "Büronun genel koordinasyonunun yanı sıra ticaret hukuku ve KVKK danışmanlığı alanlarında müvekkillere hizmet vermektedir.",
    order: 2,
  },
];

const DEFAULT_PASSWORD = "AlpekHukuk2026!";

async function main() {
  console.log("Site ayarları oluşturuluyor...");
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });

  console.log("Çalışma alanları oluşturuluyor...");
  const areaBySlug = new Map<string, string>();
  for (const area of practiceAreas) {
    const slug = toSlug(area.name);
    const created = await prisma.practiceArea.upsert({
      where: { slug },
      update: {
        name: area.name,
        icon: area.icon,
        order: area.order,
        shortDescription: area.shortDescription,
        content: area.content,
      },
      create: { ...area, slug },
    });
    areaBySlug.set(slug, created.id);
  }

  console.log("Avukat hesapları oluşturuluyor...");
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);
  for (const lawyer of lawyers) {
    const slug = toSlug(lawyer.name);
    await prisma.user.upsert({
      where: { email: lawyer.email },
      update: {
        name: lawyer.name,
        title: lawyer.title,
        role: lawyer.role,
        bio: lawyer.bio,
        order: lawyer.order,
      },
      create: {
        name: lawyer.name,
        title: lawyer.title,
        email: lawyer.email,
        passwordHash,
        role: lawyer.role,
        bio: lawyer.bio,
        order: lawyer.order,
        slug,
      },
    });
  }

  console.log("\nSeed tamamlandı.");
  console.log("Varsayılan giriş şifresi (ilk girişten sonra değiştirin):", DEFAULT_PASSWORD);
  for (const lawyer of lawyers) {
    console.log(`  - ${lawyer.email} (${lawyer.role})`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
