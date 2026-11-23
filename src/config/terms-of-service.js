// Terms of Service — bản chuẩn khách gửi 23/11/2026.
// Mỗi mục là một mảng khối nội dung (xem PolicyBlock trong PoliciesPage.jsx):
//   "chuỗi"            đoạn văn; **chữ** trong chuỗi được in đậm
//   { h3: "..." }      tiêu đề phụ trong mục
//   { list: [...] }    danh sách gạch đầu dòng
//   { contact: true }  dòng Email + Hotline có link

export const termsIntro = [
  "Welcome to Hoang Luxury Travel (HLT).",
  "Please read these Terms of Service carefully before using our website at hoangluxury.travel or booking our services.",
  "**By accessing our website, making a booking, or confirming the use of our services through HLT's official contact channels, you confirm that you have read, understood, and agree to comply with these Terms of Service and our Privacy Policy.**",
  "**Booking Requirements:**",
  {
    list: [
      "Customers making a booking must be at least 18 years old.",
      "If you book a service on behalf of others, including friends, family members, or a group, you are responsible for providing accurate information and ensuring that the people involved have authorized you or agreed to the applicable terms.",
      "HLT will provide and confirm details about the service, itinerary, pricing, and booking change and cancellation policies before the booking is completed.",
    ],
  },
  "If you do not agree with any part of these Terms of Service, please do not proceed with booking or using our services.",
  "**Hoang Luxury Travel is committed to providing clear information, professional service and respecting the legitimate rights of our customers throughout their experience.**",
];

export const termsSections = [
  {
    id: "scope-of-services", title: "Scope Of Services",
    paragraphs: [
      "These Terms of Service apply to all private passenger transportation services booked directly through Hoang Luxury Travel (HLT), including bookings made through our website, by phone, or through our official contact channels.",
      "Our services include airport transfers, intercity transfers, transfers to tourist destinations, customized private trips and transportation services for individuals, groups, or corporate partners.",
      "HLT is committed to providing services in accordance with the details agreed upon and confirmed with customers, ensuring transparency, professionalism and quality service throughout the journey.",
    ],
  },
  {
    id: "quotes-and-confirmation", title: "Price Quotes And Booking Confirmation",
    paragraphs: [
      "**Customers can submit booking requests through our website, by phone, or through HLT's official contact channels. Submitting a booking request does not mean the booking has been confirmed.**",
      "Before the customer decides to book the service, HLT will provide full information on the itinerary, pick-up and drop-off times and locations, vehicle type, service price included charges, booking modification or cancellation policies and payment methods.",
      "**A booking is officially confirmed only when HLT sends a confirmation in the form of a written document, message, or digital image containing the key details of the journey and booking information.**",
      "Customers are encouraged to keep their booking confirmation for easy reference, verification or support requests when needed.",
      "HLT aims to provide a clear, convenient, and transparent booking process and high-quality private transfer services. This helps customers feel confident from the beginning of their journey.",
    ],
  },
  {
    id: "pricing-and-payment", title: "Service Pricing And Payment Methods",
    paragraphs: [
      "At Hoang Luxury Travel (HLT), private car service prices are calculated per vehicle or agreed travel package, not per passenger, provided that the number of passengers does not exceed the vehicle's maximum allowed capacity.",
      "The service price, total amount payable, payment deadline and payment methods will be clearly stated in the quotation before the customer confirms the booking.",
      "**Prices displayed in USD on our website are for reference only. The final payment amount is determined by the currency and price stated in the quotation confirmed by both parties.**",
      "**HLT offers flexible payment methods, including cash and card payments. For international card transactions, an additional processing fee of 3% of the transaction amount will be communicated to customers before payment is made.**",
      "If customers want to change their itinerary, rest stops, adjust the route or extend the vehicle service time, HLT will inform them in advance of any additional charges (if applicable). Any extra charges will only apply after the customer has agreed to and confirmed them.",
      "**HLT is committed to transparent pricing, never adding charges without prior agreement and always ensuring that customers are fully informed before making payment.**",
    ],
  },
  {
    id: "changes-cancellations-refunds", title: "Booking Changes, Cancellations And Refunds",
    paragraphs: [
      "At Hoang Luxury Travel (HLT), we understand that travel plans may sometimes change. Therefore, HLT aims to provide a flexible, transparent and reasonable booking change and cancellation policy to protect our customers' interests.",
      { h3: "4.1. Booking Change Policy" },
      "Customers may request changes to their pick-up time or travel itinerary through the contact channel used to confirm their booking. HLT will assist with these changes depending on vehicle availability and our ability to arrange transportation at the time of the request. Any changes will only take effect after confirmation by both parties.",
      { h3: "4.2. Booking Cancellation Policy" },
      "**Customers are advised to notify HLT of any cancellation at least 48 hours before the confirmed pick-up time. Cancellation terms, applicable fees (if any), refund amounts and refund processing times will be clearly communicated by HLT before the customer confirms the booking.** For multi-day trips, partial cancellations or shortening the itinerary will be handled according to the conditions agreed upon in the booking confirmation.",
      { h3: "4.3. Customer Support and Request Handling" },
      "For booking changes, cancellations, support requests or feedback regarding service quality, please contact us through the original communication channel or call our hotline at +84 839 779 888.",
      "When contacting us, please provide your booking reference number and details of your request so that HLT can quickly review the information and offer an appropriate solution.",
      "Hoang Luxury Travel always puts customer satisfaction and interests first. We are committed to receiving and handling all requests promptly, professionally and with care.",
    ],
  },
  {
    id: "airport-pickup", title: "Airport Pick-up, Waiting Time and No-show Policy",
    paragraphs: [
      "At Hoang Luxury Travel (HLT), we understand that air travel can sometimes involve unexpected changes, such as flight delays, longer immigration procedures or waiting for luggage.",
      "To ensure a smooth airport pick-up, customers are kindly requested to provide accurate flight numbers and a phone number where they can be reached upon arrival. HLT will actively monitor flight information, confirm the pick-up location and coordinate with customers throughout the pick-up process.",
      "**HLT does not charge waiting fees for airport pick-up services. If a flight schedule changes or customers need more time to complete airport procedures, we will flexibly adjust the pick-up arrangements to suit the actual situation and provide maximum convenience for our customers.**",
      "**If a customer is not at the pick-up location at the expected time, HLT will actively contact them and check their situation before deciding on an appropriate solution. Flight delays or additional time needed for airport procedures will not automatically be considered a no-show.**",
      "At HLT, we prioritize your comfort on every journey through private car transfers, flexible arrangements and attentive service.",
    ],
  },
  {
    id: "customer-responsibilities", title: "Customer Responsibilities When Using Our Services",
    paragraphs: [
      { h3: "6.1. Travel Documents and Legal Requirements" },
      "Customers are responsible for preparing and ensuring the validity of all necessary travel documents, including passports, visas, identification documents or other documents as required by Vietnamese law.",
      { h3: "6.2. Customer Conduct and Behavior" },
      "Customers are kindly requested to behave politely and respectfully towards drivers, staff and others involved in the journey.",
      "HLT reserves the right to refuse or suspend services if a customer engages in behavior that threatens safety, uses prohibited substances, violates the law, intentionally damages the vehicle or seriously disrupts the transportation service.",
      "Any decision to refuse or suspend services will be considered based on the actual situation, the seriousness of the violation and applicable laws.",
      { h3: "6.3. Responsibility for Vehicles and Property" },
      "Customers are responsible for taking care of the vehicle and any equipment provided during the service.",
      "If a customer intentionally or through their own fault causes damage to or loss of property, they are responsible for compensating for actual, reasonable and verifiable losses in accordance with applicable laws.",
      "HLT will inform customers and provide details of the damage, repair or replacement costs so that both parties can discuss and agree on an appropriate solution.",
      { h3: "6.4. Health Information and Special Assistance Needs" },
      "If customers have any health conditions, allergies or special assistance needs that may affect their journey, please inform HLT before using our services.",
      "Information voluntarily provided by customers will help us offer suitable advice and prepare appropriate service arrangements to ensure comfort and safety throughout the trip.",
      { h3: "6.5. Luggage and Personal Belongings" },
      "Customers are kindly requested to take care of their luggage, cash, identification documents and valuable personal belongings throughout the journey.",
      "HLT and our drivers are always ready to assist customers with luggage arrangements, checking personal belongings before the trip ends and helping to locate any lost items.",
      "In the case of lost or damaged property, the responsibilities of both parties will be determined based on the cause, degree of fault, relevant agreements and applicable laws.",
      { h3: "6.6. Photos, Privacy and Media Use" },
      "During our services, HLT may take photos or record videos to capture memorable moments and share travel experiences with customers.",
      "**HLT always respects customer privacy and will only use photos or videos in which customers can be identified for promotional or marketing purposes after obtaining their appropriate consent.**",
      "Customers have the full right to refuse to be photographed or recorded, or to have their personal images used for promotional purposes, without affecting the quality of the services provided.",
      "Hoang Luxury Travel always aims to provide a safe, respectful and memorable journey, based on mutual respect, cooperation and the protection of the legitimate rights and interests of both parties.",
    ],
  },
  {
    id: "hlt-responsibilities", title: "HLT's Responsibilities, Force Majeure Event and Insurance",
    paragraphs: [
      "At Hoang Luxury Travel (HLT), customer safety and rights are always our top priorities on every journey. We are committed to providing private transfer services, focusing on vehicle quality, professional drivers and safety requirements in accordance with applicable laws.",
      { h3: "Force Majeure Events" },
      "In situations that affect safety or our ability to provide services, such as storms, floods, landslides, dangerous weather conditions, road closures, decisions by authorities or other events that qualify as force majeure under the law, HLT may adjust the departure time, change the route, suspend or postpone the journey to ensure customer safety.",
      "HLT will inform customers as soon as possible and make every effort to offer suitable alternatives. If the journey cannot continue, any services not yet provided will be handled according to the booking agreement and applicable laws.",
      { h3: "Legal Liability and Exclusions of Liability" },
      "**Hoang Luxury Travel (HLT) is not responsible for any losses, damage, injuries, delays or travel disruptions caused by force majeure events, external circumstances or situations beyond the company's reasonable control.**",
      "HLT is not required to compensate for damages arising from the situations mentioned above, unless otherwise required by applicable law.",
      "In such situations, HLT will make every effort to inform customers and help them find suitable alternatives when circumstances allow.",
      { h3: "Travel Insurance" },
      "HLT strongly recommends that customers arrange suitable travel insurance before each journey, including coverage for personal risks, medical expenses, emergency medical assistance, repatriation and personal liability.",
      "Personal travel insurance provides additional protection and does not replace any mandatory insurance responsibilities or legal obligations of HLT and transportation providers under applicable laws.",
      "**HLT always strives to provide safe, transparent and reliable journeys while offering support and assistance to customers whenever unexpected situations arise.**",
    ],
  },
  {
    id: "intellectual-property", title: "Intellectual Property and Website Use",
    paragraphs: [
      { h3: "Content Ownership" },
      "All content published on hoangluxury.travel, including but not limited to text, images, videos, designs, logos, brand names, trademarks and marketing materials, is legally owned by Hoang Luxury Travel (HLT) or used with permission from the respective owners.",
      "Customers may access, view and share content for personal, non-commercial purposes, provided that the original source is maintained and the intellectual property rights of HLT or other relevant parties are respected.",
      "**Copying, modifying, reusing, publishing, distributing or using HLT's content for commercial purposes without HLT's prior consent is STRICTLY PROHIBITED.**",
      "HLT reserves the right to request that violations stop, require the removal of unauthorized content and take appropriate measures to protect its intellectual property rights in accordance with applicable laws.",
    ],
  },
  {
    id: "terms-updates", title: "Updates and Changes to the Terms of Service",
    paragraphs: [
      "Hoang Luxury Travel (HLT) may revise, add to or update these Terms of Service from time to time to meet business needs, improve service quality and comply with applicable laws.",
      "When important changes are made, HLT will update the \"Last updated\" date on our website.",
      "We encourage customers to review these Terms of Service regularly to stay informed of the latest information. Continuing to use or book our services after the changes take effect will be considered acceptance of the updated terms, to the extent permitted by law.",
      "**For bookings confirmed before the updates take effect, HLT will continue to apply the previously agreed terms unless both parties agree to changes or the law requires otherwise.**",
    ],
  },
];
