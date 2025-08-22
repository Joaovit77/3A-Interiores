let burguer = window.document.getElementById('burguer');
let item = document.getElementById('itens');
burguer.addEventListener('click' , clickMenu);

function clickMenu(){
    if (item.style.display == 'flex'){
        item.style.display = 'none'
    } else {
        item.style.display = 'flex'
    }
}

function mudouTamanho() {
if (window.innerWidth > 700) {
    item.style.display = 'flex';
} else {
item.style.display = 'none';
}
}

function toggleSubmenu(e){
    e.preventDefault();
    let submenu = document.getElementById('submenu');
    submenu.classList.toggle('ativo');
}


const caixas = document.querySelectorAll(".cxlateral");

function mostrarAoScroll() {
  caixas.forEach(caixa => {
    const posicaoTopo = caixa.getBoundingClientRect().top;
    const alturaTela = window.innerHeight;

    // Se a caixa aparecer na tela
    if (posicaoTopo < alturaTela - 50) {
      caixa.classList.add("visivel");
    }
  });
}

// Roda ao rolar a página
window.addEventListener("scroll", mostrarAoScroll);