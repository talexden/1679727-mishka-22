const Breakpoints = {
  TABLET: 768,
  DESKTOP: 1150
};
const dafaultOfsets = {
  mobile: [0, 0],
  tablet: [0, 0],
  desktop: [0, 0]
}
let currentBreakpoint = 'mobile';
const pageMatch = window.location.pathname.match(/^\/(.*)\.html$/);
const page = pageMatch ? pageMatch[1] : `index`;
const ppOffsets = JSON.parse(localStorage.getItem(`ppOffsets`)) || {
  [page]: defaultOffsets
};
const ppEl = document.body;

const saveOffsets = () => localStorage.setItem(`ppOffsets`, JSON.stringify(ppOffsets));

const setOffsets = () => {
  ppEl.style.setProperty(`--pp-offset-x`, `${ppOffsets[page][currentBreakpoint][0]}px`);
  ppEl.style.setProperty(`--pp-offset-y`, `${ppOffsets[page][currentBreakpoint][1]}px`);
};

const setImg = () => {
  ppEl.style.setProperty(`--pp-img`, `url("../img/pixelperfect/${page}-${currentBreakpoint}.jpg")`);
};

const managePP = (pp) => {
  if (pp) {
    ppEl.classList.add(`pixelperfect`);
  } else {
    ppEl.classList.remove(`pixelperfect`);
  }
};

const movePP = (x, y) => {
  ppOffsets[page][currentBreakpoint][0] += x;
  ppOffsets[page][currentBreakpoint][1] += y;
  saveOffsets();
  setOffsets();
};

const changeScreenMode = () => {
  const {clientWidth} = document.body;
  let breakpoint = 'mobile';
  if (clientWidth >= Breakpoints.DESKTOP) {
    breakpoint = 'desktop';
  } else if (clientWidth >= Breakpoints.TABLET) {
    breakpoint = 'tablet';
  }
  if (currentBreakpoint !== breakpoint) {
    currentBreakpoint = breakpoint;
    setOffsets();
    setImg();
  }
};

changeScreenMode();

if (!ppOffsets[page]) {
  ppOffsets[page] = defaultOffsets;
  saveOffsets();
}

setOffsets();
setImg();
managePP(Number(localStorage.getItem(`pp`)));

window.addEventListener(`resize`, changeScreenMode);

document.addEventListener(`keydown`, (evt) => {
  if (document.activeElement !== document.body) {
    return;
  }

  const isPP = Boolean(Number(localStorage.getItem(`pp`)));

  if (evt.code === `KeyP`) {
    evt.preventDefault();
    const pp = Number(!isPP);
    localStorage.setItem(`pp`, pp);
    managePP(pp);
  } else if (isPP && evt.code === `ArrowUp`) {
    evt.preventDefault();
    movePP(0, -1);
  } else if (isPP && evt.code === `ArrowDown`) {
    evt.preventDefault();
    movePP(0, 1);
  } else if (isPP && evt.code === `ArrowLeft`) {
    evt.preventDefault();
    movePP(-1, 0);
  } else if (isPP && evt.code === `ArrowRight`) {
    evt.preventDefault();
    movePP(1, 0);
  }
});
