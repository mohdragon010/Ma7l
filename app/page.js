'use client';

import Link from 'next/link';
import {
  BarChart3,
  Package,
  Zap,
  Shield,
  Smartphone,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'بيع أسرع',
      description:
        'افتح فاتورة، اختار المنتجات، وسجل عملية البيع في ثواني. كل حاجة بسيطة وواضحة.'
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: 'مخزون بيتحدث تلقائياً',
      description:
        'كل عملية بيع بتخصم من المخزون تلقائياً، فتعرف المنتجات اللي قربت تخلص قبل ما الزبون يسأل عليها.'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'اعرف محلك ماشي إزاي',
      description:
        'شوف المبيعات والأرباح وأكتر المنتجات حركة من Dashboard واحدة.'
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'يفتح من أي جهاز',
      description:
        'اشتغل من الكمبيوتر أو الموبايل أو التابلت، من غير أي تثبيت.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'بياناتك محفوظة',
      description:
        'كل بيانات محلك محفوظة بأمان، وتقدر ترجع لها في أي وقت.'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'كبر شغلك',
      description:
        'الأرقام الواضحة تساعدك تعرف إيه اللي بيبيع وإيه اللي محتاج تحسين.'
    }
  ];

  const stats = [
    {
      number: '⚡',
      label: 'بيع أسرع في ثواني'
    },
    {
      number: '📦',
      label: 'المخزون بيتحدث تلقائياً'
    },
    {
      number: '💸',
      label: 'مجاني بالكامل'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8">

            <div className="space-y-6">
              <span className="inline-flex bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                نظام مجاني لإدارة المحلات
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight" dir="rtl">
                ابدأ ادارة <span className="text-primary">محلك</span> بسهولة.
              </h1>

              <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                بيع أسرع، تابع مخزونك، واعرف أرباحك أول بأول.
                <br />
                كل اللي محتاجه لإدارة محلك في مكان واحد.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">

              <Link
                dir="rtl"
                href="/authentication"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-slate-950 font-bold py-4 px-8 rounded-lg transition hover:scale-105"
              >
                ابدأ مجانًا
                <ArrowLeft className="w-5 h-5" />
              </Link>

              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 border border-slate-700 hover:border-primary hover:bg-slate-900 py-4 px-8 rounded-lg transition"
              >
                شوف المميزات
              </a>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-16 border-t border-slate-800">
              {stats.map((stat, idx) => (
                <div key={idx}>
                  <div className="text-3xl mb-3">{stat.number}</div>
                  <div className="text-slate-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50"
      >
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" dir='rtl'>
              كل اللي محلك محتاجه...
            </h2>

            <p className="text-slate-400 max-w-2xl mx-auto" dir='rtl'>
              من أول عملية بيع لآخر تقرير في اليوم، هتلاقي كل حاجة في مكان واحد.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-primary rounded-xl p-8 transition duration-300 hover:-translate-y-2"
                dir="rtl"
              >
                <div className="text-primary mb-5 group-hover:scale-110 transition">
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold mb-3">
                  {feature.title}
                </h3>

                <p className="text-slate-400 leading-8">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* How It Works */}

      <section className="py-20 px-4 sm:px-6 lg:px-8 overflow-hidden" dir="rtl">

        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-16">

            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              ابدأ في أقل من دقيقة
            </h2>

            <p className="text-slate-400">
              مش محتاج إعدادات معقدة.
            </p>

          </div>

          <div className="grid md:grid-cols-3 gap-10">

            {[
              {
                number: "1",
                title: "اعمل حساب",
                desc: "سجل حسابك في أقل من دقيقة."
              },
              {
                number: "2",
                title: "ضيف منتجاتك",
                desc: "أدخل المنتجات والأسعار مرة واحدة."
              },
              {
                number: "3",
                title: "ابدأ البيع",
                desc: "أول زبون يدخل... افتح الفاتورة وابدأ."
              }
            ].map((step, idx) => (

              <div key={idx} className="relative">

                <div className="flex flex-col items-center text-center" dir="rtl">

                  <div className="w-16 h-16 rounded-full bg-primary text-slate-950 font-bold text-2xl flex items-center justify-center mb-6" dir="rtl">
                    {step.number}
                  </div>

                  <h3 className="text-xl font-bold mb-3" dir="rtl">
                    {step.title}
                  </h3>

                  <p className="text-slate-400 leading-7" dir="rtl">
                    {step.desc}
                  </p>

                </div>

                {idx < 2 && (
                  <div className="hidden md:block absolute top-8 right-0 w-full h-px bg-linear-to-r from-primary to-transparent translate-x-full"></div>
                )}

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* Why Us */}

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">

        <div className="max-w-5xl mx-auto text-center">

          <h2 className="text-3xl sm:text-4xl font-bold mb-5">
            ليه تختار <span className='text-primary font-extrabold m-2'>محل</span>؟
          </h2>

          <p className="text-slate-400 max-w-2xl mx-auto mb-14" dir="rtl">
            معمول مخصوص للمحلات الصغيرة والمتوسطة...
            بسيط، سريع، ومش هيضيع وقتك.
          </p>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="rounded-xl border border-slate-700 p-8 bg-slate-800/50">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-bold text-xl mb-3">
                سريع
              </h3>
              <p className="text-slate-400">
                افتح فاتورة، سجل بيع، وخلص في ثواني.
              </p>
            </div>

            <div className="rounded-xl border border-slate-700 p-8 bg-slate-800/50">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="font-bold text-xl mb-3">
                معمول للمحلات
              </h3>
              <p className="text-slate-400">
                كل ميزة موجودة عشان تخدم البيع اليومي.
              </p>
            </div>

            <div className="rounded-xl border border-slate-700 p-8 bg-slate-800/50">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-bold text-xl mb-3">
                تعرف شغلك ماشي إزاي
              </h3>
              <p className="text-slate-400">
                تقارير واضحة للمبيعات والأرباح والمخزون.
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* CTA */}

      <section className="py-24 px-4 sm:px-6 lg:px-8">

        <div className="max-w-4xl mx-auto text-center">

          <h2 className="text-4xl font-bold mb-6">
            جاهز تبدأ؟
          </h2>

          <p className="text-slate-400 text-lg mb-10" dir="rtl">
            أنشئ متجرك، أضف منتجاتك، وابدأ البيع من النهارده.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/authentication">
              <Button size="lg" className={"py-3 px-7"}>
                ابدأ مجانًا
              </Button>
            </Link>
          </div>

        </div>

      </section>

      <footer className="border-t border-slate-800 py-8">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="text-slate-400">
            © 2026 Ma7l. All rights reserved.
          </div>

          <div className="flex gap-6 text-slate-400">

            <a href="#" className="hover:text-primary transition">
              المميزات
            </a>

            <a href="#" className="hover:text-primary transition">
              تواصل معنا
            </a>

            <a href="#" className="hover:text-primary transition">
              سياسة الخصوصية
            </a>

          </div>

        </div>

      </footer>
    </div>
  );
}