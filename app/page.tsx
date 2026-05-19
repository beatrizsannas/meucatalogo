import Link from 'next/link';
import { ArrowRight, ShoppingBag, MessageCircle, Zap, ShieldCheck, Star, CheckCircle2, Store, Users, LayoutDashboard, Package, DollarSign, Eye, TrendingUp } from 'lucide-react';
import Header from './components/Header';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-mint font-jakarta selection:bg-lime/50 selection:text-forest overflow-x-hidden text-forest">
            {/* INLINE STYLES FOR MARQUEE */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    display: inline-block;
                    animation: marquee 20s linear infinite;
                    white-space: nowrap;
                    will-change: transform;
                }
                .glass-header {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }
                .gradient-text {
                    background: linear-gradient(135deg, #0f2926 0%, #1a4540 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}} />

            {/* --- HEADER --- */}
            <Header />

            {/* --- HERO SECTION --- */}
            <section className="relative z-10 px-4 pt-40 pb-20 sm:pt-48 sm:pb-32 w-full flex flex-col items-center justify-center text-center">
                {/* Background Accent Gradient */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-gradient-to-b from-lime/30 to-transparent blur-[100px] pointer-events-none -z-10" />
                
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-mint-dark/50 shadow-sm mb-8">
                    <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                    <span className="text-xs font-semibold text-forest/80 uppercase tracking-wider">A ferramenta nº 1 para Lojistas</span>
                </div>

                <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-forest tracking-tight leading-[1.1] mb-6 relative z-10 max-w-4xl mx-auto">
                    A vitrine definitiva para o <br className="hidden md:block"/>
                    <span className="gradient-text">seu negócio crescer</span>
                </h1>
                
                <p className="text-lg sm:text-xl text-forest/60 max-w-2xl mx-auto mb-10 font-medium">
                    Catálogos impossíveis de ignorar, gestão de Varejo e Atacado em um só lugar e pedidos diretos no WhatsApp. Sem taxas, sem burocracia.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link
                        href="/cadastro"
                        className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-forest text-white rounded-full font-bold text-lg shadow-xl shadow-forest/20 hover:bg-forest/90 hover:-translate-y-1 transition-all duration-300"
                    >
                        <span>Começar Gratuitamente</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="#features"
                        className="px-8 py-4 bg-white text-forest border border-mint-dark/50 rounded-full font-bold text-lg hover:bg-mint-dark/10 transition-colors"
                    >
                        Ver Funcionalidades
                    </Link>
                </div>

                {/* Dashboard Mockup Placeholder */}
                <div className="mt-20 w-full max-w-5xl mx-auto relative perspective-1000">
                    <div className="absolute inset-0 bg-gradient-to-t from-mint via-transparent to-transparent z-10" />
                    <div className="w-full bg-white rounded-t-3xl shadow-2xl border border-mint-dark/50 overflow-hidden transform -rotateX-2 origin-bottom transition-transform hover:rotate-0 duration-700">
                        {/* Fake Browser Header */}
                        <div className="w-full h-12 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-amber-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                            </div>
                            <div className="mx-auto w-1/3 h-6 bg-white border border-gray-200 rounded-md flex items-center justify-center">
                                <div className="w-1/2 h-2 bg-gray-100 rounded-full" />
                            </div>
                        </div>
                        {/* Fake Dashboard Content */}
                        <div className="flex h-[400px] text-left">
                            {/* Sidebar */}
                            <div className="w-48 border-r border-gray-100 p-4 space-y-1 hidden sm:block bg-white relative">
                                <div className="flex items-center gap-2 mb-6 px-2">
                                    <div className="w-6 h-6 rounded-md bg-forest flex items-center justify-center">
                                        <span className="text-lime font-black text-[10px] uppercase">V</span>
                                    </div>
                                    <span className="font-bold text-forest text-xs">Minha Vitrine</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 bg-mint rounded-lg text-forest font-semibold text-xs">
                                    <LayoutDashboard size={14} /> Painel
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 text-forest/60 font-medium text-xs">
                                    <Package size={14} /> Produtos
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 text-forest/60 font-medium text-xs">
                                    <ShoppingBag size={14} /> Pedidos
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 text-forest/60 font-medium text-xs">
                                    <Users size={14} /> Clientes
                                </div>
                            </div>
                            {/* Main Content */}
                            <div className="flex-1 p-6 sm:p-8 bg-gray-50/50 flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="font-bold text-forest text-lg">Resumo de Hoje</h3>
                                        <p className="text-forest/50 text-[10px]">Acompanhe suas vendas em tempo real</p>
                                    </div>
                                    <div className="px-3 py-1.5 bg-lime text-forest rounded-full font-semibold text-[10px] flex items-center gap-1 shadow-sm">
                                        + Novo Produto
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                                         <div className="flex items-center gap-2 mb-2">
                                             <div className="w-6 h-6 rounded-full bg-lime/20 text-forest flex items-center justify-center"><DollarSign size={12} /></div>
                                             <span className="text-forest/60 font-semibold text-[10px]">Receita</span>
                                         </div>
                                         <div className="font-black text-forest text-lg">R$ 1.250,00</div>
                                         <div className="text-[9px] text-emerald-500 font-bold mt-1 flex items-center gap-0.5"><TrendingUp size={10} /> +15% vs ontem</div>
                                    </div>
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                                         <div className="flex items-center gap-2 mb-2">
                                             <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><ShoppingBag size={12} /></div>
                                             <span className="text-forest/60 font-semibold text-[10px]">Pedidos</span>
                                         </div>
                                         <div className="font-black text-forest text-lg">12</div>
                                         <div className="text-[9px] text-forest/40 font-semibold mt-1">4 aguardando envio</div>
                                    </div>
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                                         <div className="flex items-center gap-2 mb-2">
                                             <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center"><Eye size={12} /></div>
                                             <span className="text-forest/60 font-semibold text-[10px]">Visitas</span>
                                         </div>
                                         <div className="font-black text-forest text-lg">145</div>
                                         <div className="text-[9px] text-forest/40 font-semibold mt-1">No seu catálogo online</div>
                                    </div>
                                </div>
                                {/* Table mockup */}
                                <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4 overflow-hidden">
                                    <h4 className="font-bold text-forest text-xs mb-3">Últimos Pedidos</h4>
                                    <div className="w-full h-[1px] bg-gray-100 mb-3" />
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-forest/50">M</div>
                                                <div className="text-[10px] font-bold text-forest">Mariana Costa</div>
                                            </div>
                                            <div className="text-[10px] font-bold text-forest">R$ 350,00</div>
                                            <div className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Pago</div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-forest/50">R</div>
                                                <div className="text-[10px] font-bold text-forest">Roberto Dias</div>
                                            </div>
                                            <div className="text-[10px] font-bold text-forest">R$ 120,00</div>
                                            <div className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Pendente</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- MARQUEE --- */}
            <div className="relative w-full overflow-hidden bg-white py-6 border-y border-mint-dark/50 z-20">
                <div className="animate-marquee flex items-center">
                    <div className="flex items-center gap-12 px-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-12">
                                <span className="text-forest/40 font-bold text-xl uppercase tracking-wider flex items-center gap-2"><CheckCircle2 size={24} className="text-lime" /> Taxa Zero</span>
                                <span className="text-mint-dark/50 font-black text-2xl">•</span>
                                <span className="text-forest/40 font-bold text-xl uppercase tracking-wider flex items-center gap-2"><Store size={24} className="text-lime" /> Atacado & Varejo</span>
                                <span className="text-mint-dark/50 font-black text-2xl">•</span>
                                <span className="text-forest/40 font-bold text-xl uppercase tracking-wider flex items-center gap-2"><MessageCircle size={24} className="text-lime" /> Pedidos no WhatsApp</span>
                                <span className="text-mint-dark/50 font-black text-2xl">•</span>
                                <span className="text-forest/40 font-bold text-xl uppercase tracking-wider flex items-center gap-2"><LayoutDashboard size={24} className="text-lime" /> Gestão Intuitiva</span>
                                <span className="text-mint-dark/50 font-black text-2xl">•</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- BENTO GRID FEATURES --- */}
            <section id="features" className="relative z-10 px-4 py-24 sm:py-32 max-w-7xl mx-auto w-full">
                <div className="mb-16 text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl sm:text-5xl font-extrabold text-forest tracking-tight mb-6">
                        Tudo que você precisa, <br/>sem a complexidade.
                    </h2>
                    <p className="text-lg text-forest/60 font-medium">A ferramenta definitiva para lojistas que querem vender mais rápido, com uma gestão de estoque perfeita e sem dores de cabeça.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="md:col-span-2 bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-mint-dark/50 hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden relative group">
                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-lime/20 flex items-center justify-center text-forest mb-6">
                                <Zap size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-forest tracking-tight mb-3">Varejo & Atacado Simultâneos</h3>
                            <p className="text-forest/60 font-medium max-w-md leading-relaxed">Links separados, gestão centralizada. Defina a quantidade mínima e o preço especial para revendedores, mantendo tudo no mesmo estoque.</p>
                        </div>
                        {/* Decorative Element */}
                        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-lime/10 rounded-full blur-3xl group-hover:bg-lime/20 transition-colors" />
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-mint-dark/50 hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div>
                            <div className="w-14 h-14 rounded-2xl bg-forest/5 flex items-center justify-center text-forest mb-6">
                                <MessageCircle size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-forest tracking-tight mb-3">Venda no WhatsApp</h3>
                            <p className="text-forest/60 font-medium leading-relaxed">O cliente escolhe, e o pedido chega mastigado direto no seu zap. Conversão altíssima.</p>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-mint-dark/50 hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div>
                            <div className="w-14 h-14 rounded-2xl bg-forest/5 flex items-center justify-center text-forest mb-6">
                                <Users size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-forest tracking-tight mb-3">Gestão de Clientes</h3>
                            <p className="text-forest/60 font-medium leading-relaxed">CRM embutido. Identifique clientes recorrentes e automatize o contato com a sua base.</p>
                        </div>
                    </div>

                    {/* Card 4 */}
                    <div className="md:col-span-2 bg-forest rounded-3xl p-8 sm:p-10 shadow-xl border border-forest-light relative overflow-hidden flex flex-col sm:flex-row items-center gap-8 group">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                        <div className="relative z-10 flex-1 text-center sm:text-left">
                            <div className="w-14 h-14 rounded-2xl bg-lime/20 flex items-center justify-center text-lime mb-6 mx-auto sm:mx-0">
                                <ShieldCheck size={28} />
                            </div>
                            <h3 className="text-3xl font-bold text-white tracking-tight mb-3">Zero taxas. Lucro seu.</h3>
                            <p className="text-mint/70 font-medium leading-relaxed">Não somos intermediadores de pagamento. Você vende, você recebe o valor integral na hora. Sem comissões escondidas.</p>
                        </div>
                        <div className="relative z-10 w-full sm:w-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center min-w-[200px]">
                             <span className="text-6xl font-black text-lime">0%</span>
                             <span className="text-white/60 font-semibold uppercase tracking-wider text-sm mt-2">De Comissão</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEEDBACKS --- */}
            <section className="relative z-10 bg-white px-4 py-24 sm:py-32 w-full border-t border-mint-dark/30">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16 text-center">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-forest tracking-tight mb-4">
                            Lojistas que amam a plataforma
                        </h2>
                        <p className="text-lg text-forest/60 font-medium max-w-2xl mx-auto">Resultados reais de quem simplificou as vendas do dia a dia.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Feedback 1 */}
                        <div className="bg-mint/30 rounded-2xl p-8 border border-mint-dark/50">
                            <div className="flex gap-1 mb-6 text-amber-400">
                                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
                            </div>
                            <p className="text-forest/80 font-medium leading-relaxed mb-8">"Antes eu perdia horas montando pedido pelo WhatsApp. Agora os clientes mandam tudo pronto, separadinho por foto. Mudou o meu jogo na loja."</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-forest text-lime flex items-center justify-center font-bold text-lg">M</div>
                                <div>
                                    <p className="text-forest font-bold">Mariana Silva</p>
                                    <p className="text-forest/50 text-sm">Loja de Roupas</p>
                                </div>
                            </div>
                        </div>
                        {/* Feedback 2 */}
                        <div className="bg-forest rounded-2xl p-8 shadow-xl transform sm:-translate-y-4">
                            <div className="flex gap-1 mb-6 text-lime">
                                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
                            </div>
                            <p className="text-white/90 font-medium leading-relaxed mb-8">"A divisão entre atacado e varejo é genial. Eu consigo esconder os preços de revenda do cliente final sem precisar de dois catálogos diferentes."</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-lime text-forest flex items-center justify-center font-bold text-lg">R</div>
                                <div>
                                    <p className="text-white font-bold">Roberto Mendes</p>
                                    <p className="text-lime/70 text-sm">Distribuidora de Pratas</p>
                                </div>
                            </div>
                        </div>
                        {/* Feedback 3 */}
                        <div className="bg-mint/30 rounded-2xl p-8 border border-mint-dark/50">
                            <div className="flex gap-1 mb-6 text-amber-400">
                                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
                            </div>
                            <p className="text-forest/80 font-medium leading-relaxed mb-8">"O fato de não cobrarem taxa por venda foi o que mais me chamou atenção. O lucro finalmente fica todo comigo e não nas mãos da maquininha online."</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-forest text-lime flex items-center justify-center font-bold text-lg">C</div>
                                <div>
                                    <p className="text-forest font-bold">Camila Fontes</p>
                                    <p className="text-forest/50 text-sm">Cosméticos Naturais</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FINAL CTA --- */}
            <section className="bg-lime px-4 py-24 text-center flex flex-col items-center justify-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-forest tracking-tight mb-6">
                        Pronto para transformar seu negócio?
                    </h2>
                    <p className="text-forest/70 text-xl font-medium mb-10">Crie sua vitrine em menos de 2 minutos e comece a receber pedidos hoje mesmo.</p>
                    <Link
                        href="/cadastro"
                        className="group inline-flex items-center gap-3 px-10 py-5 bg-forest text-white rounded-full font-bold text-xl shadow-xl hover:bg-forest/90 hover:shadow-2xl hover:-translate-y-1 transition-all"
                    >
                        <span>Criar Conta Gratuita</span>
                        <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* --- ELEGANT FOOTER --- */}
            <footer className="bg-white py-12 px-6 border-t border-mint-dark/50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center">
                            <span className="text-lime font-black text-sm uppercase">V</span>
                        </div>
                        <span className="font-bold text-forest">Minha Vitrine</span>
                    </div>
                    <p className="text-forest/50 text-sm font-medium">© {new Date().getFullYear()} Minha Vitrine. Todos os direitos reservados.</p>
                    <div className="flex gap-6">
                        <Link href="/login" className="text-forest/60 hover:text-forest font-semibold text-sm transition-colors">Entrar</Link>
                        <Link href="/cadastro" className="text-forest/60 hover:text-forest font-semibold text-sm transition-colors">Cadastrar</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
