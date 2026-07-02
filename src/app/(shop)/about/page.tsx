import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { BRAND, mediaUrl } from "@/lib/brand";

export const metadata: Metadata = {
  title: "About — Hashmi Eastern Medicine Clinic",
  description:
    "The story of HEMC and its founder Dr. Hafiz Abdul Sattar Hashmi — practitioner, lecturer and researcher in Eastern Medicine, and the clinic's work across Pakistan.",
};

const FACTS = [
  { label: "Founded by", value: "Dr. Hafiz Abdul Sattar Hashmi" },
  { label: "Born", value: "25 Oct 1986 · Khairpur Tamewali, Bahawalpur" },
  { label: "Qualifications", value: "BEMS · M.Phil Phytomedicine (89.26%) · Ph.D. Fellow" },
  { label: "Languages", value: "English · Urdu · Punjabi · Saraiki" },
];

const STORY: { heading?: string; body: string[]; bullets?: string[] }[] = [
  {
    body: [
      "Hafiz Abdul Sattar Hashmi is an academician, traditional medicine practitioner, and researcher whose life journey reflects an unwavering commitment to human development, ethical healthcare, and academic excellence. Choosing the path of service and knowledge over commercial gain, Hashmi has become a respected figure in the field of Eastern and Complementary Medicine in Pakistan.",
      "Born on October 25, 1986, in Khairpur Tamewali, Bahawalpur District, he began his educational journey with the sacred completion of Hifz-e-Quran in 2001. This early discipline instilled values of patience, purpose, and sincerity that would later define his career. He pursued a Bachelor of Eastern Medicine and Surgery (BEMS), graduating in 2011, followed by a high-achieving M.Phil. in Phytomedicine (89.26%) in 2019 from The Islamia University of Bahawalpur (IUB). He is currently a Ph.D. Fellow in Eastern Medicine, focusing on the anti-diabetic potential of Citrullus colocynthis, aligning traditional knowledge with cutting-edge scientific validation.",
    ],
  },
  {
    heading: "From Managing Director to Human Developer",
    body: [
      "For nearly a decade, Hashmi held the position of Managing Director and Head of R&D at Ehsan Herbal Pharmacy, Bahawalpur. During this time, he had every opportunity to pursue commercial success, manage business expansion, and grow profits. However, his vision extended beyond the boardroom. Rather than choosing a conventional business trajectory, he redirected his energy toward education, healthcare access, and the development of evidence-based traditional medicine.",
      "This conscious shift from business leadership to academic and social service speaks volumes about his priorities: building human capacity, reforming healthcare systems, and mentoring the next generation. He joined the University College of Conventional Medicine (UCCM), IUB, first as an Associate Lecturer in 2020 and then as a full Lecturer (BS-18) from 2022 onwards.",
    ],
  },
  {
    heading: "Clinical and Research Excellence",
    body: [
      "Parallel to his academic duties, Hashmi operates Hashmi Eastern Medicine Clinic in his hometown, where he practices Eastern and natural medicine. His clinical philosophy centers on affordability, accessibility, and therapeutic integrity — making quality healthcare available to underserved populations.",
      "His research bridges traditional wisdom with scientific method. His publications span anti-inflammatory studies, phytochemical analysis, COVID-19 mental health impacts, and novel polyherbal anti-diabetic treatments. He is a co-author of research published in reputable journals such as Frontiers in Medicine, Heliyon, SAGE Open Medicine, Dose-Response, and the Springer Reference Series in Phytochemistry. His work on early detection of COVID-19 and polyherbal formulations for glycemic control has placed him at the forefront of evidence-based traditional medicine in Pakistan.",
    ],
  },
  {
    heading: "Educational Leadership & National Service",
    body: ["Beyond his personal research, Hashmi is deeply involved in academic leadership and national policy development. He has:"],
    bullets: [
      "Been nominated as Focal Person by the Ministry of National Health Services, representing IUB in national policymaking committees for Unani Medicine.",
      "Served as Managing Editor of the International Journal of Natural Medicine and Health Sciences (IJNMHS).",
      "Worked with the Punjab Health Care Commission to develop Minimum Service Delivery Standards (MSDS) for Traditional Medicine.",
      "Coordinated special collections in international journals like Frontiers in Medicine.",
      "Actively participated in over a dozen international seminars and workshops on research, safety, and health policy.",
    ],
  },
  {
    heading: "A Philosophy Rooted in Purpose",
    body: [
      "Hashmi's story is one of intentional trade-offs. Where many choose the path of financial success, he pursued ethical development, scholarly contribution, and clinical impact. His decision to leave business management and dedicate himself to research and education was not made lightly — it stemmed from a higher belief that true success lies in developing people, not profits.",
    ],
  },
  {
    heading: "Looking Ahead",
    body: [
      "Hashmi's vision for the future includes establishing a research center for integrative diabetes management, mentoring emerging scholars in Eastern medicine, and continuing to serve in academic and clinical roles that uphold both tradition and innovation. With fluency in English, Urdu, Punjabi, and Saraiki, and a deep-rooted connection to both rural and academic communities, he stands as a bridge between heritage and modern science.",
    ],
  },
  {
    heading: "Recognition and Influence",
    body: [
      "Dr. Hafiz Abdul Sattar Hashmi has earned national recognition as a multifaceted leader in Eastern Medicine, known for seamlessly blending traditional healing wisdom with modern scientific rigor. As a practitioner, he has served communities through his long-standing clinic, offering evidence-informed care rooted in centuries-old practices. His commitment to policy development is evident through his nomination as a Focal Person by the Ministry of National Health Services and his role in formulating Minimum Service Delivery Standards for Traditional Medicine under the Punjab Healthcare Commission.",
      "In academia, Hashmi stands out as a research-driven educator and mentor, nurturing future professionals at The Islamia University of Bahawalpur through his teaching, curriculum leadership, and editorial contributions. His research, published in leading journals such as Frontiers in Medicine, Springer, and SAGE, has advanced the scientific understanding of traditional formulations — particularly in diabetes, mental health, and immunomodulation. Collectively, his work reflects a rare synthesis of clinical care, policy advocacy, and human development.",
    ],
  },
];

const GALLERY = [
  { src: "activities/seminar-bzu-multan.webp", caption: "International Seminar — “Expanding Eastern Medicine for Health of All”, Bahauddin Zakariya University, Multan" },
  { src: "activities/award-iub-2022.webp", caption: "Certificate of Appreciation — “Health with Eastern Medicine” seminar, The Islamia University of Bahawalpur (2022)" },
  { src: "activities/workshop-msds.webp", caption: "Consultative Workshop — Minimum Service Delivery Standards for Traditional Medicine" },
  { src: "activities/policy-consultation.webp", caption: "National policy consultation for Eastern Medicine" },
  { src: "activities/faculty-iub.webp", caption: "With faculty & colleagues, University College of Conventional Medicine, IUB" },
  { src: "activities/meeting-dignitaries.webp", caption: "Meeting with health officials and dignitaries" },
  { src: "activities/delegation-meeting.webp", caption: "Delegation on traditional-medicine policy" },
  { src: "activities/official-visit-2025.webp", caption: "Engagements with public-health leaders" },
  { src: "activities/clinic-gathering.webp", caption: "Community & clinic gatherings" },
];

export default function AboutPage() {
  return (
    <div className="container about">
      <section className="about__hero card">
        <div>
          <span className="eyebrow">About us</span>
          <h1>{BRAND.fullName}</h1>
          <p>
            HEMC brings together traditional Unani and herbal medicine with modern, evidence-based research.
            Founded and led by Dr. Hafiz Abdul Sattar Hashmi, the clinic is built on a simple belief — that
            quality, ethical healthcare should be affordable and within reach for everyone.
          </p>
          <div className="about__actions">
            <Link className="btn btn--primary" href="/shop">Browse remedies</Link>
            <a className="btn btn--ghost" href="#our-work">See our work</a>
          </div>
        </div>
        <div className="about__hero-media">
          <img src={BRAND.bannerUrl} alt={BRAND.fullName} />
        </div>
      </section>

      <section className="section about__founder">
        <div className="about__bio">
          <span className="eyebrow">The founder</span>
          <h2>Dr. Hafiz Abdul Sattar Hashmi</h2>
          <p className="about__credentials">Ph.D. Fellow in Eastern Medicine · Lecturer · Researcher · Practitioner · Editor</p>
          {STORY.map((block, i) => (
            <div className="about__block" key={i}>
              {block.heading && <h3>{block.heading}</h3>}
              {block.body.map((p, j) => <p key={j}>{p}</p>)}
              {block.bullets && (
                <ul className="about__list">
                  {block.bullets.map((b, k) => (
                    <li key={k}><Icon name="check" size={16} />{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <aside className="about__facts card">
          <h3>At a glance</h3>
          {FACTS.map((f) => (
            <div className="about__fact" key={f.label}>
              <span>{f.label}</span>
              <strong>{f.value}</strong>
            </div>
          ))}
        </aside>
      </section>

      <section className="section" id="our-work">
        <div className="section-head">
          <div><h2>Our work</h2><p>Seminars, research and national health-policy contributions.</p></div>
        </div>
        <div className="gallery-grid">
          {GALLERY.map((g) => (
            <figure className="gallery-card" key={g.src}>
              <img src={mediaUrl(g.src)} alt={g.caption} loading="lazy" />
              <figcaption>{g.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="cta">
        <div>
          <h2>Care rooted in tradition, guided by science.</h2>
          <p>Explore our herbal formulas or reach out for a consultation with the clinic.</p>
        </div>
        <Link className="btn btn--light btn--lg" href="/shop">Browse remedies</Link>
      </section>
    </div>
  );
}
