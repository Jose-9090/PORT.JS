 window.addEventListener('load', function () {
            setTimeout(function () {
                document.body.classList.remove('loading');
                document.body.classList.add('loaded');
            }, 300);
        });

        var curtainRemoveu = false;

        window.addEventListener('scroll', function () {
            var curtain = document.getElementById('curtain');
            if (curtainRemoveu || !curtain) return;

            if (window.scrollY > 20) {
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