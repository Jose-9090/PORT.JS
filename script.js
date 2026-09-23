 window.addEventListener('load', function () {
            digitarNoScroll();
            setTimeout(function () {
                document.body.classList.remove('loading');
                document.body.classList.add('loaded');
            }, 300);
        });

        var codigoComando = '<node server.js -start>';
        var scrollMaxDigitacao = 220;
        var bootMostrado = false;
        var progressoMaximo = 0;
        var ctxTecla = null;

        function tocarTecla() {
            try {
                if (!ctxTecla) {
                    ctxTecla = new (window.AudioContext || window.webkitAudioContext)();
                }
                if (ctxTecla.state === 'suspended') ctxTecla.resume();
                var t = ctxTecla.currentTime;
                var osc = ctxTecla.createOscillator();
                var ganho = ctxTecla.createGain();
                osc.type = 'square';
                osc.frequency.value = 220 + Math.random() * 90;
                ganho.gain.setValueAtTime(0.04, t);
                ganho.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
                osc.connect(ganho);
                ganho.connect(ctxTecla.destination);
                osc.start(t);
                osc.stop(t + 0.07);
            } catch (e) {}
        }

        function digitarNoScroll() {
            var el = document.getElementById('typedText');
            if (!el) return;

            var y = Math.max(0, Math.min(window.scrollY, scrollMaxDigitacao));
            var n = Math.round((y / scrollMaxDigitacao) * codigoComando.length);

            if (n > progressoMaximo) {
                var novas = n - progressoMaximo;
                for (var i = 0; i < Math.min(novas, 4); i++) tocarTecla();
                progressoMaximo = n;
            }

            el.textContent = codigoComando.slice(0, progressoMaximo);

            if (progressoMaximo >= codigoComando.length && !bootMostrado) {
                bootMostrado = true;
                setTimeout(mostrarBoot, 200);
            }
        }

        function mostrarBoot() {
            var out = document.getElementById('termOut');
            var prog = document.getElementById('termProgress');
            var done = document.getElementById('termDone');

            if (out) out.classList.add('show');
            setTimeout(function () {
                if (prog) prog.classList.add('show');
            }, 300);
            setTimeout(function () {
                if (done) done.classList.add('show');
            }, 2900);
        }

        var curtainRemoveu = false;

        window.addEventListener('scroll', function () {
            digitarNoScroll();

            var curtain = document.getElementById('curtain');
            if (curtainRemoveu || !curtain) return;

            if (window.scrollY > 420) {
                curtainRemoveu = true;
                curtain.classList.add('out');

                setTimeout(function () {
                    if (curtain.parentNode) curtain.style.display = 'none';
                }, 1250);

                setTimeout(function () {
                    document.getElementById('assistantBubble').classList.add('visible');
                }, 1500);
            }
        });

        function abrirAssistente() {
            var assist = document.getElementById('assistant');
            assist.classList.remove('minimized');
            document.getElementById('assistantBubble').classList.add('visible');
        }

        function alternarAssistente() {
            var assist = document.getElementById('assistant');
            if (assist.classList.contains('minimized')) {
                abrirAssistente();
            } else {
                minimizarAssistente();
            }
        }

        function minimizarAssistente() {
            document.getElementById('assistant').classList.add('minimized');
            document.getElementById('assistantBubble').classList.remove('visible');
        }

        function alternarNav() {
            var navbar = document.querySelector('.navbar');
            if (navbar) navbar.classList.toggle('nav-open');
        }

        (function () {
            var links = document.querySelectorAll('.nav-links a');
            for (var i = 0; i < links.length; i++) {
                links[i].addEventListener('click', function () {
                    var navbar = document.querySelector('.navbar');
                    if (navbar) navbar.classList.remove('nav-open');
                });
            }
        })();
        function carregarAtividadesSalvas(pagina) {
            var chave = 'atividades_' + pagina;
            var salvos = localStorage.getItem(chave);
            if (!salvos) return;
            try {
                var atividades = JSON.parse(salvos);
                for (var i = 0; i < atividades.length; i++) {
                    var container = document.getElementById(atividades[i].eixo + '-' + pagina);
                    if (container) {
                        var figure = document.createElement('figure');
                        figure.innerHTML = '<img src="' + atividades[i].imagem + '" class="rotacionar"><figcaption>' + atividades[i].nome + '</figcaption>';
                        container.appendChild(figure);
                    }
                }
            } catch (err) {}
        }

        function adicionarAtividade(pagina) {
            var eixo = document.getElementById('eixoAtividade-' + pagina).value;
            var nome = document.getElementById('nomeAtividade-' + pagina).value;
            var arquivo = document.getElementById('arquivoAtividade-' + pagina).files[0];
            
            if (!nome || !arquivo) {
                alert('Preencha o nome e selecione uma imagem!');
                return;
            }
            
            var reader = new FileReader();
            reader.onload = function(e) {
                var container = document.getElementById(eixo + '-' + pagina);
                var figure = document.createElement('figure');
                figure.innerHTML = '<img src="' + e.target.result + '" class="rotacionar"><figcaption>' + nome + '</figcaption>';
                container.appendChild(figure);
                
                var chave = 'atividades_' + pagina;
                var salvos = JSON.parse(localStorage.getItem(chave) || '[]');
                salvos.push({ eixo: eixo, nome: nome, imagem: e.target.result });
                localStorage.setItem(chave, JSON.stringify(salvos));
                
                document.getElementById('nomeAtividade-' + pagina).value = '';
                document.getElementById('arquivoAtividade-' + pagina).value = '';
            };
            reader.readAsDataURL(arquivo);
        }

        carregarAtividadesSalvas('senai');