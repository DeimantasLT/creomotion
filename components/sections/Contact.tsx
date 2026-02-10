import { Mail, Phone, MapPin } from 'lucide-react';

export function Contact() {
  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'hello@creomotion.lt',
      link: 'mailto:hello@creomotion.lt',
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+370 600 00000',
      link: 'tel:+37060000000',
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Vilnius, Lithuania',
      link: '#',
    },
  ];

  return (
    <section id="contact" className="py-24 bg-[#F5F5F0]">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-black mb-6">
            LET&apos;S CREATE
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Have a project in mind? Let&apos;s discuss how AI-powered motion design can elevate your brand.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {contactInfo.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.link}
                className="group p-8 border-2 border-black bg-white text-center hover:bg-black hover:text-white transition-colors"
              >
                <Icon className="w-8 h-8 mx-auto mb-4" />
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                  {item.label}
                </div>
                <div className="font-semibold">{item.value}</div>
              </a>
            );
          })}
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto mt-16 p-8 border-2 border-black bg-white">
          <form className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-wider mb-2">Name</label>
              <input
                type="text"
                className="w-full p-4 border-2 border-gray-200 focus:border-black outline-none bg-[#F5F5F0]"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                className="w-full p-4 border-2 border-gray-200 focus:border-black outline-none bg-[#F5F5F0]"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider mb-2">Message</label>
              <textarea
                rows={4}
                className="w-full p-4 border-2 border-gray-200 focus:border-black outline-none bg-[#F5F5F0]"
                placeholder="Tell me about your project..."
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-black text-white font-semibold border-2 border-black hover:bg-[#FF2E63] transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
