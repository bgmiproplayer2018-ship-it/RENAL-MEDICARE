import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  User, 
  Clock, 
  ArrowRight, 
  Tag, 
  X, 
  Share2, 
  HeartHandshake, 
  Sparkles,
  Search
} from 'lucide-react';
import { BlogPost, CompanySettings } from '../../types.ts';
import { ScrollAnimatedImage } from '../common/ScrollAnimatedImage.tsx';
import { CardGridSkeleton } from '../common/Skeletons.tsx';

interface BlogPageProps {
  blogs: BlogPost[];
  initialArticleId?: string;
  onNavigate: (tab: string, param?: string) => void;
  settings?: CompanySettings;
}

export const BlogPage: React.FC<BlogPageProps> = ({
  blogs,
  initialArticleId,
  onNavigate,
  settings,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (initialArticleId) {
      const found = blogs.find(b => b.id === initialArticleId || b.slug === initialArticleId);
      if (found) setActiveArticle(found);
    }
  }, [initialArticleId, blogs]);

  const categories = ['All', 'Dialysis Care', 'Diet & Nutrition', 'Home Dialysis', 'Kidney Health'];

  const filteredBlogs = blogs.filter(b => {
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    const matchesSearch = 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-12 sm:space-y-16 py-8">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-50 via-white to-emerald-50/50 p-5 sm:p-12 rounded-2xl sm:rounded-3xl border border-blue-100/80 shadow-xs space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#005BBD]/10 text-[#005BBD] text-xs font-bold uppercase tracking-wider">
            Clinical Knowledge Hub
          </div>
          <h1 className="text-2xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Kidney Health &amp; <span className="text-[#005BBD]">Dialysis Guidance</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-base leading-relaxed max-w-3xl">
            Evidence-based medical advice written by senior nephrologists, renal dietitians, and certified dialysis nursing supervisors to help you and your family live well.
          </p>

          {/* Search & Categories */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 sm:left-4 top-3 sm:top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search diet, potassium, fistula, home dialysis..."
                className="w-full pl-10 sm:pl-11 pr-4 py-2 sm:py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-[#005BBD] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 pt-1 pb-1">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`shrink-0 whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedCategory === c
                    ? 'bg-[#005BBD] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blogs Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {blogs.length === 0 ? (
          <CardGridSkeleton count={6} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredBlogs.map((post, idx) => {
              const postImg = post.id === 'blog-1' && (post.featuredImage.includes('1579684385127') || !post.featuredImage || post.featuredImage === '/images/ckd-dialysis-unit.jpg')
                ? '/images/ckd-dialysis-unit.jpg'
                : post.id === 'blog-3' && (post.featuredImage.includes('1516549655169') || !post.featuredImage || post.featuredImage === '/images/patient-dialysis-hospital-room.jpg')
                ? '/images/patient-dialysis-hospital-room.jpg'
                : post.featuredImage;

              return (
                <article
                  key={post.id}
                  onClick={() => setActiveArticle(post)}
                  className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
                >
                <div>
                  <div className="h-44 sm:h-52 relative overflow-hidden bg-slate-100">
                    <ScrollAnimatedImage
                      src={postImg}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      containerClassName="w-full h-full"
                      animation="scale-in"
                      delay={(idx % 3) * 0.08}
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold text-[#005BBD] shadow-xs z-10">
                      {post.category}
                    </div>
                  </div>

                <div className="p-4 sm:p-6 space-y-2.5 sm:space-y-3">
                  <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#005BBD] transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 pt-0 border-t border-slate-100 mt-3 sm:mt-4 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700 truncate max-w-[150px]">{post.author}</span>
                <span className="text-[#005BBD] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform shrink-0">
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
              </article>
            );
          })}
        </div>
        )}
      </section>

      {/* ARTICLE READER MODAL */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header Bar */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#005BBD]">
                <BookOpen className="w-4 h-4 shrink-0" />
                <span className="truncate">{activeArticle.category}</span>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Hero Image */}
            <div className="h-48 sm:h-80 w-full relative bg-slate-100 overflow-hidden">
              <ScrollAnimatedImage
                src={
                  activeArticle.id === 'blog-1' && (activeArticle.featuredImage.includes('1579684385127') || !activeArticle.featuredImage || activeArticle.featuredImage === '/images/ckd-dialysis-unit.jpg')
                    ? '/images/ckd-dialysis-unit.jpg'
                    : activeArticle.id === 'blog-3' && (activeArticle.featuredImage.includes('1516549655169') || !activeArticle.featuredImage || activeArticle.featuredImage === '/images/patient-dialysis-hospital-room.jpg')
                    ? '/images/patient-dialysis-hospital-room.jpg'
                    : activeArticle.featuredImage
                }
                alt={activeArticle.title}
                className="w-full h-full object-cover"
                containerClassName="w-full h-full"
                animation="scale-in"
                priority={true}
              />
            </div>

            {/* Article Content */}
            <div className="p-4 sm:p-10 space-y-4 sm:space-y-6">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500">
                  <span className="font-bold text-slate-900">{activeArticle.author}</span>
                  <span>&bull;</span>
                  <span>{activeArticle.date}</span>
                  <span>&bull;</span>
                  <span>{activeArticle.readTime}</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {activeArticle.title}
                </h2>
              </div>

              {/* Rich Markdown / Paragraph rendering */}
              <div className="prose prose-slate max-w-none text-xs sm:text-base leading-relaxed text-slate-700 space-y-3 sm:space-y-4">
                {activeArticle.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {/* Tags */}
              <div className="pt-3 sm:pt-4 border-t border-slate-100 flex flex-wrap gap-1.5 sm:gap-2">
                {activeArticle.tags.map((t, i) => (
                  <span key={i} className="text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-blue-50 text-[#005BBD] font-semibold">
                    #{t}
                  </span>
                ))}
              </div>

              {/* Consultation CTA in Blog */}
              <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-blue-50 border border-blue-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Have specific questions about your kidney health?</h4>
                  <p className="text-[11px] sm:text-xs text-slate-600">Consult one of our senior Nephrologists today.</p>
                </div>
                <button
                  onClick={() => {
                    setActiveArticle(null);
                    onNavigate('appointment');
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#005BBD] text-white font-bold text-xs shadow hover:bg-[#004A99] whitespace-nowrap cursor-pointer text-center"
                >
                  Book Nephrology Consult
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
