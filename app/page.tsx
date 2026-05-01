import Link from 'next/link';
import { ArrowRight, ShoppingBag, MessageCircle, Zap, ShieldCheck, Star } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-forest font-jakarta selection:bg-lime selection:text-forest overflow-x-hidden text-mint">
            {/* INLINE STYLES FOR MARQUEE */}
            <style dangerouslySetInnerHTML={{
                __html: `
                body {
                    background-color: #0f2926;
                }
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
                .brutal-shadow {
                    box-shadow: 8px 8px 0px 0px #d0f274;
                }
                .brutal-shadow-hover:hover {
                    box-shadow: 12px 12px 0px 0px #d0f274;
                    transform: translate(-4px, -4px);
                }
                .text-stroke {
                    -webkit-text-stroke: 1px #d0f274;
                    color: transparent;
                }
            `}} />

            {/* --- HEADER --- */}
            <header className="relative z-20 px-6 py-6 flex items-center justify-between border-b-2 border-mint-dark/10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-lime flex items-center justify-center">
                        <span className="text-forest font-black text-2xl uppercase tracking-tighter">V</span>
                    </div>
                    <span className="font-black text-white text-xl uppercase tracking-tighter hidden sm:block">
                        A VITRINE DO SEU NEGÓCIO
                    </span>
                </div>
                <Link
                    href="/login"
                    className="px-6 py-3 border-2 border-lime text-lime font-black uppercase tracking-widest text-sm hover:bg-lime hover:text-forest transition-all"
                >
                    ENTRAR
                </Link>
            </header>

            {/* --- HERO SECTION --- */}
            <section className="relative z-10 px-4 pt-20 pb-32 sm:pt-32 sm:pb-40 w-full flex flex-col items-center justify-center text-center">
                {/* Background Accent */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] h-[300px] bg-lime/10 blur-[150px] pointer-events-none" />
                
                <h1 className="text-[12vw] sm:text-[10vw] md:text-[8vw] font-black text-white uppercase tracking-tighter leading-[0.85] mb-8 relative z-10">
                    DOMINE <br/>
                    <span className="text-lime">SUAS VENDAS</span>
                </h1>
                
                <p className="text-lg sm:text-2xl text-mint/60 max-w-3xl mb-12 font-bold uppercase tracking-wider">
                    Catálogos impossíveis de ignorar • Varejo e Atacado integrados • Pedidos diretos no WhatsApp
                </p>
                
                <Link
                    href="/cadastro"
                    className="group relative inline-flex items-center justify-center gap-4 px-10 py-6 bg-lime text-forest font-black text-xl sm:text-2xl uppercase tracking-tighter brutal-shadow brutal-shadow-hover transition-all duration-200"
                >
                    <span>CRIAR VITRINE GRÁTIS</span>
                    <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
                </Link>
                <p className="mt-8 text-sm text-lime/50 font-bold uppercase tracking-widest">SEM TAXAS POR VENDA • SETUP EM 2 MINUTOS</p>
            </section>

            {/* --- MARQUEE --- */}
            <div className="relative w-full overflow-hidden bg-lime py-4 border-y-4 border-forest rotate-[-2deg] scale-105 z-20">
                <div className="animate-marquee flex items-center">
                    {/* Repeat content twice to make infinite loop seamless */}
                    <div className="flex items-center gap-8 px-4">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex items-center gap-8">
                                <span className="text-forest font-black text-4xl uppercase tracking-tighter">TAXA ZERO</span>
                                <span className="text-forest font-black text-2xl">•</span>
                                <span className="text-forest font-black text-4xl uppercase tracking-tighter text-stroke">ATACADO & VAREJO</span>
                                <span className="text-forest font-black text-2xl">•</span>
                                <span className="text-forest font-black text-4xl uppercase tracking-tighter">PEDIDOS NO WHATSAPP</span>
                                <span className="text-forest font-black text-2xl">•</span>
                                <span className="text-forest font-black text-4xl uppercase tracking-tighter text-stroke">GESTÃO FÁCIL</span>
                                <span className="text-forest font-black text-2xl">•</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- BRUTALIST GRID --- */}
            <section className="relative z-10 px-4 py-32 max-w-7xl mx-auto w-full">
                <div className="mb-20">
                    <h2 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-6">
                        VELOCIDADE.<br/> <span className="text-lime">PERFORMANCE.</span>
                    </h2>
                    <p className="text-xl text-mint/50 font-bold max-w-2xl">A ferramenta definitiva para lojistas que querem crescer rápido e sem burocracia.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Card 1 */}
                    <div className="border-4 border-lime p-8 sm:p-12 hover:bg-lime/5 transition-colors flex flex-col justify-between min-h-[350px]">
                        <Zap size={64} className="text-lime mb-8" />
                        <div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Varejo & Atacado</h3>
                            <p className="text-lg text-mint/60 font-medium">Links separados, gestão centralizada. Seus clientes finais vêem um preço, seus revendedores vêem outro. Simples e letal.</p>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-lime p-8 sm:p-12 flex flex-col justify-between min-h-[350px]">
                        <MessageCircle size={64} className="text-forest mb-8" />
                        <div>
                            <h3 className="text-3xl font-black text-forest uppercase tracking-tighter mb-4">Direto pro WhatsApp</h3>
                            <p className="text-lg text-forest/80 font-bold">O cliente monta o carrinho e a mensagem chega formatada no seu zap. Sem checkouts complexos, conversão imediata.</p>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="md:col-span-2 border-4 border-mint-dark/20 p-8 sm:p-12 hover:border-lime transition-colors flex flex-col sm:flex-row items-center gap-12">
                        <div className="flex-1">
                            <ShieldCheck size={64} className="text-white mb-8" />
                            <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">TAXA ZERO POR VENDA</h3>
                            <p className="text-xl text-mint/60 font-medium">Não somos intermediadores. Você vende, você recebe. Sem comissões escondidas rasgando seu lucro.</p>
                        </div>
                        <div className="w-full sm:w-1/3 aspect-square border-2 border-lime flex items-center justify-center p-8 brutal-shadow relative bg-forest">
                             <div className="absolute inset-0 bg-lime/10 animate-pulse" />
                             <span className="text-8xl font-black text-lime">0%</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEEDBACKS --- */}
            <section className="relative z-10 px-4 py-32 max-w-7xl mx-auto w-full border-t-2 border-mint-dark/10">
                <div className="mb-20 text-center">
                    <h2 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-6">
                        RESULTADOS <span className="text-lime">REAIS.</span>
                    </h2>
                    <p className="text-xl text-mint/50 font-bold max-w-2xl mx-auto">O que dizem os lojistas que já aceleraram suas vendas.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feedback 1 */}
                    <div className="border-4 border-mint-dark/20 p-8 flex flex-col justify-between hover:border-lime transition-colors brutal-shadow bg-forest">
                        <div className="flex gap-1 mb-6 text-lime">
                            {[...Array(5)].map((_, i) => <Star key={i} size={24} fill="currentColor" />)}
                        </div>
                        <p className="text-xl text-white font-bold mb-8">"Antes eu perdia horas montando pedido pelo WhatsApp. Agora os clientes mandam tudo pronto. Mudou o jogo."</p>
                        <div>
                            <p className="text-lime font-black uppercase tracking-tighter">MARIANA S.</p>
                            <p className="text-mint/50 text-sm font-bold uppercase tracking-widest">Loja de Roupas</p>
                        </div>
                    </div>
                    {/* Feedback 2 */}
                    <div className="bg-lime border-4 border-lime p-8 flex flex-col justify-between brutal-shadow transform hover:-translate-y-2 transition-transform">
                        <div className="flex gap-1 mb-6 text-forest">
                            {[...Array(5)].map((_, i) => <Star key={i} size={24} fill="currentColor" />)}
                        </div>
                        <p className="text-xl text-forest font-bold mb-8">"A divisão entre atacado e varejo é genial. Escondo os preços de revenda sem precisar de dois catálogos diferentes."</p>
                        <div>
                            <p className="text-forest font-black uppercase tracking-tighter">ROBERTO M.</p>
                            <p className="text-forest/70 text-sm font-bold uppercase tracking-widest">Distribuidora</p>
                        </div>
                    </div>
                    {/* Feedback 3 */}
                    <div className="border-4 border-mint-dark/20 p-8 flex flex-col justify-between hover:border-lime transition-colors brutal-shadow bg-forest">
                        <div className="flex gap-1 mb-6 text-lime">
                            {[...Array(5)].map((_, i) => <Star key={i} size={24} fill="currentColor" />)}
                        </div>
                        <p className="text-xl text-white font-bold mb-8">"O fato de não cobrarem taxa por venda foi o que mais me chamou atenção. O lucro finalmente fica todo comigo."</p>
                        <div>
                            <p className="text-lime font-black uppercase tracking-tighter">CAMILA F.</p>
                            <p className="text-mint/50 text-sm font-bold uppercase tracking-widest">Cosméticos</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FINAL TAKEOVER CTA --- */}
            <section className="bg-lime px-4 py-32 text-center flex flex-col items-center justify-center border-t-8 border-white">
                <h2 className="text-[10vw] sm:text-[8vw] md:text-[6vw] font-black text-forest uppercase tracking-tighter leading-[0.8] mb-12">
                    ACELERE<br/> SEUS RESULTADOS.
                </h2>
                <Link
                    href="/cadastro"
                    className="group flex items-center gap-4 px-12 py-6 bg-forest text-lime font-black text-2xl uppercase tracking-widest hover:bg-black transition-colors"
                >
                    <span>COMEÇAR AGORA</span>
                    <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform" />
                </Link>
            </section>

            {/* --- BRUTAL FOOTER --- */}
            <footer className="bg-black py-12 px-6 border-t border-white/10">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white flex items-center justify-center">
                            <span className="text-black font-black text-xl uppercase tracking-tighter">V</span>
                        </div>
                        <span className="font-black text-white text-lg uppercase tracking-tighter">A VITRINE DO SEU NEGÓCIO</span>
                    </div>
                    <div className="flex gap-8">
                        <Link href="/login" className="text-white/50 hover:text-white font-bold uppercase tracking-widest text-sm transition-colors">ENTRAR</Link>
                        <Link href="/cadastro" className="text-lime hover:text-white font-bold uppercase tracking-widest text-sm transition-colors">CADASTRO</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
