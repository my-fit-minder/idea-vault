import { Card } from './ui/Card';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Product Manager',
    content: 'Ideafy has completely transformed how I capture and organize my thoughts. The offline support means I never lose an idea, even on flights. The AI insights are incredibly helpful for developing concepts.',
    rating: 5,
    avatar: 'SC',
  },
  {
    name: 'Michael Rodriguez',
    role: 'Entrepreneur',
    content: 'As someone who has ideas at all hours, having a tool that syncs across devices and works offline is a game-changer. The tag system helps me find related ideas instantly.',
    rating: 5,
    avatar: 'MR',
  },
  {
    name: 'Emily Johnson',
    role: 'Writer',
    content: 'The clean interface and powerful search make it easy to manage hundreds of ideas. I love how I can quickly tag and filter to find exactly what I need when inspiration strikes.',
    rating: 5,
    avatar: 'EJ',
  },
  {
    name: 'David Kim',
    role: 'Designer',
    content: 'Ideafy keeps all my creative ideas in one place. The AI-powered reports help me see patterns and connections I might have missed. Highly recommend!',
    rating: 5,
    avatar: 'DK',
  },
  {
    name: 'Lisa Anderson',
    role: 'Developer',
    content: 'The offline-first approach is perfect for my workflow. I can capture ideas anywhere, and they automatically sync when I\'m back online. Simple, powerful, and free!',
    rating: 5,
    avatar: 'LA',
  },
  {
    name: 'James Wilson',
    role: 'Consultant',
    content: 'I\'ve tried many idea management tools, but Ideafy strikes the perfect balance between simplicity and power. The tagging system and search are exactly what I needed.',
    rating: 5,
    avatar: 'JW',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1 mb-3">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Loved by Creators and Innovators
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what people are saying about Ideafy
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} hover className="flex flex-col">
              <StarRating rating={testimonial.rating} />
              <p className="text-gray-700 mb-6 flex-grow leading-relaxed">
                &quot;{testimonial.content}&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
