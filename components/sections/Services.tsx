import { Film, Palette, Clock, Zap } from 'lucide-react';

export function Services() {
  const services = [
    {
      icon: Film,
      title: 'AI Video Production',
      description: 'End-to-end video production accelerated with AI. From concept to final delivery 3x faster.',
    },
    {
      icon: Palette,
      title: 'Motion Graphics',
      description: 'Broadcast-quality motion design for TV, web, and social media. 16+ years of experience.',
    },
    {
      icon: Clock,
      title: 'Time Tracking',
      description: 'Transparent project management with integrated time tracking and real-time progress updates.',
    },
    {
      icon: Zap,
      title: 'Rapid Delivery',
      description: 'Tight deadline? No problem. AI-assisted workflows deliver premium results in record time.',
    },
  ];

  return (
    <section id="services" className="py-24 bg-[#F5F5F0]">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-black mb-6">
            SERVICES
          </h2>
          <p className="text-lg text-gray-600">
            Premium motion design services powered by AI and years of broadcast experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="p-8 border-2 border-black bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow"
              >
                <div className="text-5xl font-display font-bold text-[#FF2E63] mb-4">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <Icon className="w-8 h-8 mb-4" />
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
