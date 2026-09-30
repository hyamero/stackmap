// Ported from the canvas board: every scroll timeline, as GSAP percentage keyframes over one 10 s scene.
// Eases "cb:x1,y1,x2,y2" are the board's cubic-beziers (made into CustomEases at run time).
import type { Tween } from '../timeline';

export const TWEENS: Tween[] = [
 {
  "target": ".a-hero-out",
  "frames": {
   "0%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "filter": "blur(0px)"
   },
   "100%": {
    "opacity": "0",
    "transform": "translateY(-90px)",
    "filter": "blur(8px)",
    "ease": "cb:0.77,0,0.175,1"
   }
  }
 },
 {
  "target": ".a-hero-chips",
  "frames": {
   "0%": {
    "opacity": "1",
    "transform": "scale(1)"
   },
   "100%": {
    "opacity": "0",
    "transform": "scale(0.72)",
    "ease": "cb:0.77,0,0.175,1"
   }
  }
 },
 {
  "target": ".a-hbridge",
  "frames": {
   "0%": {
    "strokeDashoffset": "1"
   },
   "42%": {
    "strokeDashoffset": "1"
   },
   "78%": {
    "strokeDashoffset": "0",
    "ease": "cb:0.77,0,0.175,1"
   },
   "100%": {
    "strokeDashoffset": "0"
   }
  }
 },
 {
  "target": ".a-hmarks",
  "frames": {
   "0%": {
    "opacity": "1"
   },
   "40%": {
    "opacity": "1"
   },
   "52%": {
    "opacity": "0"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-vx",
  "frames": {
   "0%": {
    "opacity": "1",
    "transform": "scale(1.35) rotate(-24deg)"
   },
   "7%": {
    "opacity": "1",
    "transform": "scale(1) rotate(0deg)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "26%": {
    "opacity": "1",
    "transform": "scale(1) rotate(0deg)",
    "filter": "blur(0px)"
   },
   "40%": {
    "opacity": "1",
    "transform": "scale(0) rotate(240deg)",
    "filter": "blur(10px)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "41%": {
    "opacity": "0"
   },
   "100%": {
    "opacity": "0",
    "transform": "scale(0) rotate(240deg)"
   }
  }
 },
 {
  "target": ".a-kw",
  "frames": {
   "0%": {
    "opacity": "1",
    "transform": "scale(1)",
    "filter": "blur(0px)"
   },
   "27%": {
    "opacity": "1",
    "transform": "scale(1)",
    "filter": "blur(0px)"
   },
   "38%": {
    "opacity": "0",
    "transform": "scale(0.12)",
    "filter": "blur(14px)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "100%": {
    "opacity": "0",
    "transform": "scale(0.12)"
   }
  }
 },
 {
  "target": ".a-k1w0",
  "frames": {
   "0%": {
    "transform": "translateY(112%)"
   },
   "2%": {
    "transform": "translateY(112%)"
   },
   "6.2%": {
    "transform": "translateY(0%)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "transform": "translateY(0%)"
   }
  }
 },
 {
  "target": ".a-k1w1",
  "frames": {
   "0%": {
    "transform": "translateY(112%)"
   },
   "3.6%": {
    "transform": "translateY(112%)"
   },
   "7.8%": {
    "transform": "translateY(0%)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "transform": "translateY(0%)"
   }
  }
 },
 {
  "target": ".a-k1w2",
  "frames": {
   "0%": {
    "transform": "translateY(112%)"
   },
   "5.2%": {
    "transform": "translateY(112%)"
   },
   "9.4%": {
    "transform": "translateY(0%)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "transform": "translateY(0%)"
   }
  }
 },
 {
  "target": ".a-k1w3",
  "frames": {
   "0%": {
    "transform": "translateY(112%)"
   },
   "6.8%": {
    "transform": "translateY(112%)"
   },
   "11%": {
    "transform": "translateY(0%)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "transform": "translateY(0%)"
   }
  }
 },
 {
  "target": ".a-k1w4",
  "frames": {
   "0%": {
    "transform": "translateY(112%)"
   },
   "8.4%": {
    "transform": "translateY(112%)"
   },
   "12.6%": {
    "transform": "translateY(0%)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "transform": "translateY(0%)"
   }
  }
 },
 {
  "target": ".a-k2w0",
  "frames": {
   "0%": {
    "transform": "translateY(112%)"
   },
   "15%": {
    "transform": "translateY(112%)"
   },
   "19.2%": {
    "transform": "translateY(0%)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "transform": "translateY(0%)"
   }
  }
 },
 {
  "target": ".a-k2w1",
  "frames": {
   "0%": {
    "transform": "translateY(112%)"
   },
   "16.6%": {
    "transform": "translateY(112%)"
   },
   "20.8%": {
    "transform": "translateY(0%)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "transform": "translateY(0%)"
   }
  }
 },
 {
  "target": ".a-k2w2",
  "frames": {
   "0%": {
    "transform": "translateY(112%)"
   },
   "18.2%": {
    "transform": "translateY(112%)"
   },
   "22.4%": {
    "transform": "translateY(0%)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "transform": "translateY(0%)"
   }
  }
 },
 {
  "target": ".a-k2w3",
  "frames": {
   "0%": {
    "transform": "translateY(112%)"
   },
   "19.8%": {
    "transform": "translateY(112%)"
   },
   "24%": {
    "transform": "translateY(0%)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "transform": "translateY(0%)"
   }
  }
 },
 {
  "target": ".a-k1c",
  "frames": {
   "0%": {
    "color": "var(--sm-text)"
   },
   "15%": {
    "color": "var(--sm-text)"
   },
   "19%": {
    "color": "var(--sm-text-muted)"
   },
   "100%": {
    "color": "var(--sm-text-muted)"
   }
  }
 },
 {
  "target": ".a-cdot",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "scale(0)"
   },
   "29%": {
    "opacity": "0",
    "transform": "scale(0)"
   },
   "31%": {
    "opacity": "1",
    "transform": "scale(1.9)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "33%": {
    "transform": "scale(1)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "35.5%": {
    "transform": "scale(1.9)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "38%": {
    "transform": "scale(1)",
    "backgroundColor": "var(--sm-edge)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "41.5%": {
    "transform": "scale(0.5)",
    "backgroundColor": "var(--sm-text)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "43.5%": {
    "opacity": "1",
    "transform": "scale(5)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "46%": {
    "opacity": "0",
    "transform": "scale(0)"
   },
   "100%": {
    "opacity": "0",
    "transform": "scale(0)"
   }
  }
 },
 {
  "target": ".a-shock",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "scale(0.02)"
   },
   "43%": {
    "opacity": "0",
    "transform": "scale(0.02)"
   },
   "43.5%": {
    "opacity": "0.7",
    "transform": "scale(0.02)"
   },
   "53%": {
    "opacity": "0",
    "transform": "scale(1)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0",
    "transform": "scale(1)"
   }
  }
 },
 {
  "target": ".a-s2grid",
  "frames": {
   "0%": {
    "opacity": "0",
    "WebkitMaskSize": "0px 0px",
    "maskSize": "0px 0px"
   },
   "43%": {
    "opacity": "1",
    "WebkitMaskSize": "0px 0px",
    "maskSize": "0px 0px"
   },
   "55%": {
    "opacity": "1",
    "WebkitMaskSize": "2400px 2400px",
    "maskSize": "2400px 2400px",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "WebkitMaskSize": "2400px 2400px",
    "maskSize": "2400px 2400px"
   }
  }
 },
 {
  "target": ".a-mk",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "scale(1)"
   },
   "45%": {
    "opacity": "0"
   },
   "45.5%": {
    "opacity": "1",
    "transform": "scale(1)"
   },
   "64%": {
    "opacity": "1",
    "transform": "scale(1)"
   },
   "70%": {
    "opacity": "0",
    "transform": "scale(1.04)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-mkdot",
  "frames": {
   "0%": {
    "transform": "scale(0.2)",
    "opacity": "0"
   },
   "45.5%": {
    "transform": "scale(0.2)",
    "opacity": "0"
   },
   "50%": {
    "transform": "scale(1)",
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "transform": "scale(1)",
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-mksrc",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "scale(0.9)"
   },
   "49%": {
    "opacity": "0",
    "transform": "scale(0.9)"
   },
   "52.5%": {
    "opacity": "1",
    "transform": "scale(1)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "scale(1)"
   }
  }
 },
 {
  "target": ".a-mktgt",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(0.75px) scale(0.985)"
   },
   "58%": {
    "opacity": "0",
    "transform": "translateY(0.75px) scale(0.985)"
   },
   "62%": {
    "opacity": "1",
    "transform": "translateY(0px) scale(1)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px) scale(1)"
   }
  }
 },
 {
  "target": ".a-s2e",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "77%": {
    "opacity": "0"
   },
   "77.5%": {
    "opacity": "1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-s2eln",
  "frames": {
   "0%": {
    "strokeDashoffset": "1"
   },
   "77.5%": {
    "strokeDashoffset": "1"
   },
   "83%": {
    "strokeDashoffset": "0",
    "ease": "cb:0.33,1,0.68,1"
   },
   "100%": {
    "strokeDashoffset": "0"
   }
  }
 },
 {
  "target": ".a-s2eah",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "83%": {
    "opacity": "0"
   },
   "84%": {
    "opacity": "1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-s2sel",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "86%": {
    "opacity": "0"
   },
   "88%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-s2lead",
  "frames": {
   "0%": {
    "strokeDashoffset": "1",
    "opacity": "1"
   },
   "88%": {
    "strokeDashoffset": "1"
   },
   "92%": {
    "strokeDashoffset": "0",
    "ease": "cb:0.33,1,0.68,1"
   },
   "100%": {
    "strokeDashoffset": "0"
   }
  }
 },
 {
  "target": ".a-s2ev",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "91%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "94%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   }
  }
 },
 {
  "target": ".a-s2cap1",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(12px)"
   },
   "55%": {
    "opacity": "0",
    "transform": "translateY(12px)"
   },
   "60%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "65%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   },
   "69%": {
    "opacity": "0",
    "transform": "translateY(-8px)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-s2cap2",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(12px)"
   },
   "93%": {
    "opacity": "0",
    "transform": "translateY(12px)"
   },
   "97%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   }
  }
 },
 {
  "target": ".a-mapi-box",
  "frames": {
   "0%": {
    "left": "552px",
    "top": "498px",
    "width": "144px",
    "height": "96px",
    "borderRadius": "28px",
    "opacity": "0"
   },
   "64%": {
    "left": "552px",
    "top": "498px",
    "width": "144px",
    "height": "96px",
    "borderRadius": "28px",
    "opacity": "0"
   },
   "64.5%": {
    "opacity": "1"
   },
   "74%": {
    "left": "396px",
    "top": "418px",
    "width": "280px",
    "height": "64px",
    "borderRadius": "14px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "100%": {
    "left": "396px",
    "top": "418px",
    "width": "280px",
    "height": "64px",
    "borderRadius": "14px",
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-mapi-ov",
  "frames": {
   "0%": {
    "opacity": "1"
   },
   "68%": {
    "opacity": "1"
   },
   "76%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-mapi-in",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "72%": {
    "opacity": "0"
   },
   "79%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-mdb-box",
  "frames": {
   "0%": {
    "left": "744px",
    "top": "306px",
    "width": "144px",
    "height": "96px",
    "borderRadius": "28px",
    "opacity": "0"
   },
   "64%": {
    "left": "744px",
    "top": "306px",
    "width": "144px",
    "height": "96px",
    "borderRadius": "28px",
    "opacity": "0"
   },
   "64.5%": {
    "opacity": "1"
   },
   "74%": {
    "left": "764px",
    "top": "418px",
    "width": "280px",
    "height": "64px",
    "borderRadius": "14px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "100%": {
    "left": "764px",
    "top": "418px",
    "width": "280px",
    "height": "64px",
    "borderRadius": "14px",
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-mdb-ov",
  "frames": {
   "0%": {
    "opacity": "1"
   },
   "68%": {
    "opacity": "1"
   },
   "76%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-mdb-in",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "72%": {
    "opacity": "0"
   },
   "79%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-tr0",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "37%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "39.2%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   }
  }
 },
 {
  "target": ".a-tr1",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "41%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "43.2%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   }
  }
 },
 {
  "target": ".a-tr2",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "44%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "46.2%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   }
  }
 },
 {
  "target": ".a-tr3",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "45%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "47.2%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   }
  }
 },
 {
  "target": ".a-tr4",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "47.5%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "49.7%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   }
  }
 },
 {
  "target": ".a-tr5",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "49%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "51.2%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   }
  }
 },
 {
  "target": ".a-tr6",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "53%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "55.2%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   }
  }
 },
 {
  "target": ".a-tr7",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "56.5%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "58.7%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   }
  }
 },
 {
  "target": ".a-tr8",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "61%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "63.2%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   }
  }
 },
 {
  "target": ".a-tr9",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "64.5%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "66.7%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   }
  }
 },
 {
  "target": ".a-tr10",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "65.5%": {
    "opacity": "0",
    "transform": "translateY(8px)"
   },
   "67.7%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   }
  }
 },
 {
  "target": ".a-jr0",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "40%": {
    "opacity": "0"
   },
   "41.2%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-jr1",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "40.7%": {
    "opacity": "0"
   },
   "41.9%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-jr2",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "41.4%": {
    "opacity": "0"
   },
   "42.6%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-jr3",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "42.8%": {
    "opacity": "0"
   },
   "44%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-jr4",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "43.5%": {
    "opacity": "0"
   },
   "44.7%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-jr5",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "44.2%": {
    "opacity": "0"
   },
   "45.4%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-jr6",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "44.9%": {
    "opacity": "0"
   },
   "46.1%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-jr7",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "45.3%": {
    "opacity": "0"
   },
   "46.5%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-jr8",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "45.9%": {
    "opacity": "0"
   },
   "47.1%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-jr9",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "46.3%": {
    "opacity": "0"
   },
   "47.5%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-jr10",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "47%": {
    "opacity": "0"
   },
   "48.2%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-jr11",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "47.7%": {
    "opacity": "0"
   },
   "48.9%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-jr12",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "48.4%": {
    "opacity": "0"
   },
   "49.6%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-jr13",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "49.1%": {
    "opacity": "0"
   },
   "50.3%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-jr14",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "49.8%": {
    "opacity": "0"
   },
   "51%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-jr15",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "50.5%": {
    "opacity": "0"
   },
   "51.7%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-jr16",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "51.2%": {
    "opacity": "0"
   },
   "52.4%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-jr17",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "51.9%": {
    "opacity": "0"
   },
   "53.1%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-fly0",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translate(694px, -342px) scale(0.32)"
   },
   "55%": {
    "opacity": "0",
    "transform": "translate(694px, -342px) scale(0.32)"
   },
   "60%": {
    "opacity": "1",
    "transform": "translate(0px, 0px) scale(1)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translate(0px, 0px) scale(1)"
   }
  }
 },
 {
  "target": ".a-fly1",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translate(371px, -322px) scale(0.32)"
   },
   "56.6%": {
    "opacity": "0",
    "transform": "translate(371px, -322px) scale(0.32)"
   },
   "61.6%": {
    "opacity": "1",
    "transform": "translate(0px, 0px) scale(1)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translate(0px, 0px) scale(1)"
   }
  }
 },
 {
  "target": ".a-fly2",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translate(49px, -303px) scale(0.32)"
   },
   "58.2%": {
    "opacity": "0",
    "transform": "translate(49px, -303px) scale(0.32)"
   },
   "63.2%": {
    "opacity": "1",
    "transform": "translate(0px, 0px) scale(1)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translate(0px, 0px) scale(1)"
   }
  }
 },
 {
  "target": ".a-fly3",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translate(-274px, -244px) scale(0.32)"
   },
   "59.8%": {
    "opacity": "0",
    "transform": "translate(-274px, -244px) scale(0.32)"
   },
   "64.8%": {
    "opacity": "1",
    "transform": "translate(0px, 0px) scale(1)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translate(0px, 0px) scale(1)"
   }
  }
 },
 {
  "target": ".a-st0",
  "frames": {
   "0%": {
    "opacity": "1"
   },
   "1%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "30%": {
    "opacity": "1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-sd0",
  "frames": {
   "0%": {
    "backgroundColor": "var(--sm-text)"
   },
   "0.5%": {
    "backgroundColor": "var(--sm-text)"
   },
   "100%": {
    "backgroundColor": "var(--sm-text)"
   }
  }
 },
 {
  "target": ".a-st1",
  "frames": {
   "0%": {
    "opacity": "0.42"
   },
   "29%": {
    "opacity": "0.42"
   },
   "31%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "50%": {
    "opacity": "1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-sd1",
  "frames": {
   "0%": {
    "backgroundColor": "var(--sm-stage)"
   },
   "29.5%": {
    "backgroundColor": "var(--sm-stage)"
   },
   "30.5%": {
    "backgroundColor": "var(--sm-text)"
   },
   "100%": {
    "backgroundColor": "var(--sm-text)"
   }
  }
 },
 {
  "target": ".a-st2",
  "frames": {
   "0%": {
    "opacity": "0.42"
   },
   "49%": {
    "opacity": "0.42"
   },
   "51%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "62%": {
    "opacity": "1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-sd2",
  "frames": {
   "0%": {
    "backgroundColor": "var(--sm-stage)"
   },
   "49.5%": {
    "backgroundColor": "var(--sm-stage)"
   },
   "50.5%": {
    "backgroundColor": "var(--sm-text)"
   },
   "100%": {
    "backgroundColor": "var(--sm-text)"
   }
  }
 },
 {
  "target": ".a-st3",
  "frames": {
   "0%": {
    "opacity": "0.42"
   },
   "61%": {
    "opacity": "0.42"
   },
   "63%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-sd3",
  "frames": {
   "0%": {
    "backgroundColor": "var(--sm-stage)"
   },
   "61.5%": {
    "backgroundColor": "var(--sm-stage)"
   },
   "62.5%": {
    "backgroundColor": "var(--sm-text)"
   },
   "100%": {
    "backgroundColor": "var(--sm-text)"
   }
  }
 },
 {
  "target": ".a-ty0",
  "frames": {
   "0%": {
    "width": "0ch",
    "borderRightColor": "var(--sm-text)"
   },
   "2%": {
    "width": "0ch",
    "borderRightColor": "var(--sm-text)"
   },
   "10%": {
    "width": "28ch",
    "borderRightColor": "var(--sm-text)",
    "ease": "steps(28)"
   },
   "10.4%": {
    "width": "28ch",
    "borderRightColor": "transparent"
   },
   "100%": {
    "width": "28ch",
    "borderRightColor": "transparent"
   }
  }
 },
 {
  "target": ".a-ty1",
  "frames": {
   "0%": {
    "width": "0ch",
    "borderRightColor": "transparent"
   },
   "10.5%": {
    "width": "0ch",
    "borderRightColor": "var(--sm-text)"
   },
   "18.5%": {
    "width": "29ch",
    "borderRightColor": "var(--sm-text)",
    "ease": "steps(29)"
   },
   "18.9%": {
    "width": "29ch",
    "borderRightColor": "transparent"
   },
   "100%": {
    "width": "29ch",
    "borderRightColor": "transparent"
   }
  }
 },
 {
  "target": ".a-ty2",
  "frames": {
   "0%": {
    "width": "0ch",
    "borderRightColor": "transparent"
   },
   "19%": {
    "width": "0ch",
    "borderRightColor": "var(--sm-text)"
   },
   "25%": {
    "width": "23ch",
    "borderRightColor": "var(--sm-text)",
    "ease": "steps(23)"
   },
   "25.4%": {
    "width": "23ch",
    "borderRightColor": "var(--sm-text)"
   },
   "100%": {
    "width": "23ch",
    "borderRightColor": "var(--sm-text)"
   }
  }
 },
 {
  "target": ".a-bigp",
  "frames": {
   "0%": {
    "opacity": "1",
    "transform": "translate(0px, 0px) scale(1)"
   },
   "26.5%": {
    "opacity": "1",
    "transform": "translate(0px, 0px) scale(1)"
   },
   "34%": {
    "opacity": "1",
    "transform": "translate(-6px, -95px) scale(0.2344)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "35.5%": {
    "opacity": "0",
    "transform": "translate(-6px, -95px) scale(0.2344)"
   },
   "100%": {
    "opacity": "0",
    "transform": "translate(-6px, -95px) scale(0.2344)"
   }
  }
 },
 {
  "target": ".a-tp",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "34.5%": {
    "opacity": "0"
   },
   "35.5%": {
    "opacity": "1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-term",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(24px)"
   },
   "26%": {
    "opacity": "0",
    "transform": "translateY(24px)"
   },
   "32%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "44%": {
    "transform": "translateX(0px)"
   },
   "44.6%": {
    "transform": "translateX(-7px)"
   },
   "45.2%": {
    "transform": "translateX(6px)"
   },
   "45.8%": {
    "transform": "translateX(-4px)"
   },
   "46.4%": {
    "transform": "translateX(2px)"
   },
   "47%": {
    "transform": "translateX(0px)"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateX(0px)"
   }
  }
 },
 {
  "target": ".a-json",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(24px)"
   },
   "38%": {
    "opacity": "0",
    "transform": "translateY(24px)"
   },
   "42%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   }
  }
 },
 {
  "target": ".a-fxbad",
  "frames": {
   "0%": {
    "opacity": "1",
    "maxWidth": "11ch"
   },
   "49.5%": {
    "opacity": "1",
    "maxWidth": "11ch"
   },
   "51.5%": {
    "opacity": "0",
    "maxWidth": "0ch",
    "ease": "cb:0.77,0,0.175,1"
   },
   "100%": {
    "opacity": "0",
    "maxWidth": "0ch"
   }
  }
 },
 {
  "target": ".a-fxok",
  "frames": {
   "0%": {
    "opacity": "0",
    "maxWidth": "0ch"
   },
   "51%": {
    "opacity": "0",
    "maxWidth": "0ch"
   },
   "53%": {
    "opacity": "1",
    "maxWidth": "8ch",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "maxWidth": "8ch"
   }
  }
 },
 {
  "target": ".a-drop0",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateZ(560px)"
   },
   "13%": {
    "opacity": "0",
    "transform": "translateZ(560px)"
   },
   "14%": {
    "opacity": "1",
    "ease": "cb:0.55,0,1,0.45"
   },
   "17.2%": {
    "transform": "translateZ(0px)"
   },
   "18.2%": {
    "transform": "translateZ(16px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "19.2%": {
    "opacity": "1",
    "transform": "translateZ(0px)",
    "ease": "cb:0.55,0,1,0.45"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateZ(0px)"
   }
  }
 },
 {
  "target": ".a-efade0",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "47%": {
    "opacity": "0"
   },
   "50.6%": {
    "opacity": "1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-drop1",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateZ(560px)"
   },
   "17.6%": {
    "opacity": "0",
    "transform": "translateZ(560px)"
   },
   "18.6%": {
    "opacity": "1",
    "ease": "cb:0.55,0,1,0.45"
   },
   "21.8%": {
    "transform": "translateZ(0px)"
   },
   "22.8%": {
    "transform": "translateZ(16px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "23.8%": {
    "opacity": "1",
    "transform": "translateZ(0px)",
    "ease": "cb:0.55,0,1,0.45"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateZ(0px)"
   }
  }
 },
 {
  "target": ".a-efade1",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "49.2%": {
    "opacity": "0"
   },
   "52.8%": {
    "opacity": "1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-drop2",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateZ(560px)"
   },
   "22.2%": {
    "opacity": "0",
    "transform": "translateZ(560px)"
   },
   "23.2%": {
    "opacity": "1",
    "ease": "cb:0.55,0,1,0.45"
   },
   "26.4%": {
    "transform": "translateZ(0px)"
   },
   "27.4%": {
    "transform": "translateZ(16px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "28.4%": {
    "opacity": "1",
    "transform": "translateZ(0px)",
    "ease": "cb:0.55,0,1,0.45"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateZ(0px)"
   }
  }
 },
 {
  "target": ".a-efade2",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "51.4%": {
    "opacity": "0"
   },
   "55%": {
    "opacity": "1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-drop3",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateZ(560px)"
   },
   "26.8%": {
    "opacity": "0",
    "transform": "translateZ(560px)"
   },
   "27.8%": {
    "opacity": "1",
    "ease": "cb:0.55,0,1,0.45"
   },
   "31%": {
    "transform": "translateZ(0px)"
   },
   "32%": {
    "transform": "translateZ(16px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "33%": {
    "opacity": "1",
    "transform": "translateZ(0px)",
    "ease": "cb:0.55,0,1,0.45"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateZ(0px)"
   }
  }
 },
 {
  "target": ".a-efade3",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "53.6%": {
    "opacity": "0"
   },
   "57.2%": {
    "opacity": "1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-drop4",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateZ(560px)"
   },
   "31.4%": {
    "opacity": "0",
    "transform": "translateZ(560px)"
   },
   "32.4%": {
    "opacity": "1",
    "ease": "cb:0.55,0,1,0.45"
   },
   "35.6%": {
    "transform": "translateZ(0px)"
   },
   "36.6%": {
    "transform": "translateZ(16px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "37.6%": {
    "opacity": "1",
    "transform": "translateZ(0px)",
    "ease": "cb:0.55,0,1,0.45"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateZ(0px)"
   }
  }
 },
 {
  "target": ".a-efade4",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "55.8%": {
    "opacity": "0"
   },
   "59.4%": {
    "opacity": "1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-drop5",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateZ(560px)"
   },
   "36%": {
    "opacity": "0",
    "transform": "translateZ(560px)"
   },
   "37%": {
    "opacity": "1",
    "ease": "cb:0.55,0,1,0.45"
   },
   "40.2%": {
    "transform": "translateZ(0px)"
   },
   "41.2%": {
    "transform": "translateZ(16px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "42.2%": {
    "opacity": "1",
    "transform": "translateZ(0px)",
    "ease": "cb:0.55,0,1,0.45"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateZ(0px)"
   }
  }
 },
 {
  "target": ".a-efade5",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "58%": {
    "opacity": "0"
   },
   "61.6%": {
    "opacity": "1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-ahin",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "60%": {
    "opacity": "0"
   },
   "61.5%": {
    "opacity": "1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-frin",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "40%": {
    "opacity": "0"
   },
   "46%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".vcam .hd",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "58%": {
    "opacity": "0"
   },
   "61%": {
    "opacity": "1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-lights",
  "frames": {
   "0%": {
    "clipPath": "circle(0px at 2456px 1304px)"
   },
   "13%": {
    "clipPath": "circle(3600px at 2456px 1304px)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "100%": {
    "clipPath": "circle(3600px at 2456px 1304px)"
   }
  }
 },
 {
  "target": ".a-plane",
  "frames": {
   "0%": {
    "transform": "rotateX(58deg) translateY(-20px) scale(0.92)"
   },
   "30%": {
    "transform": "rotateX(58deg) translateY(-20px) scale(0.92)"
   },
   "50%": {
    "transform": "rotateX(0deg) translateY(0px) scale(1)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "100%": {
    "transform": "rotateX(0deg) translateY(0px) scale(1)"
   }
  }
 },
 {
  "target": ".a-pgrid",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "6%": {
    "opacity": "0"
   },
   "14%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "50%": {
    "opacity": "1"
   },
   "58%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-vclip",
  "frames": {
   "0%": {
    "clipPath": "inset(-900px round 20px)"
   },
   "52%": {
    "clipPath": "inset(-900px round 20px)"
   },
   "60%": {
    "clipPath": "inset(0px round 20px)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "100%": {
    "clipPath": "inset(0px round 20px)"
   }
  }
 },
 {
  "target": ".a-dtitle",
  "frames": {
   "0%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   },
   "46%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   },
   "53%": {
    "opacity": "0",
    "transform": "translateY(-20px)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-vstage",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "50%": {
    "opacity": "0"
   },
   "60%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-vhead",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(-6px)"
   },
   "60%": {
    "opacity": "0",
    "transform": "translateY(-6px)"
   },
   "65%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   }
  }
 },
 {
  "target": ".a-vch0",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(-6px)"
   },
   "64%": {
    "opacity": "0",
    "transform": "translateY(-6px)"
   },
   "68%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   }
  }
 },
 {
  "target": ".a-vch1",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(-6px)"
   },
   "66%": {
    "opacity": "0",
    "transform": "translateY(-6px)"
   },
   "70%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   }
  }
 },
 {
  "target": ".a-vch2",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(-6px)"
   },
   "68%": {
    "opacity": "0",
    "transform": "translateY(-6px)"
   },
   "72%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   }
  }
 },
 {
  "target": ".a-vinsp",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateX(14px)"
   },
   "70%": {
    "opacity": "0",
    "transform": "translateX(14px)"
   },
   "76%": {
    "opacity": "1",
    "transform": "translateX(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateX(0px)"
   }
  }
 },
 {
  "target": ".a-ks0",
  "frames": {
   "0%": {
    "left": "340px",
    "top": "615.2px",
    "height": "49.6px",
    "opacity": "1"
   },
   "16%": {
    "left": "340px",
    "top": "615.2px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "23%": {
    "left": "300.3px",
    "top": "592.1px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "36%": {
    "left": "300.3px",
    "top": "592.1px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "43%": {
    "left": "495.3px",
    "top": "468.2px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "56%": {
    "left": "495.3px",
    "top": "468.2px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "63%": {
    "left": "506.9px",
    "top": "486.3px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "76%": {
    "left": "506.9px",
    "top": "486.3px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "83%": {
    "left": "558.1px",
    "top": "486.3px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "100%": {
    "left": "558.1px",
    "top": "486.3px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   }
  }
 },
 {
  "target": ".a-kf0_0",
  "frames": {
   "0%": {
    "opacity": "1"
   },
   "16%": {
    "opacity": "1"
   },
   "20%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kf0_1",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "19%": {
    "opacity": "0"
   },
   "23%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "36%": {
    "opacity": "1"
   },
   "40%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kf0_2",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "39%": {
    "opacity": "0"
   },
   "43%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "56%": {
    "opacity": "1"
   },
   "60%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kf0_3",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "59%": {
    "opacity": "0"
   },
   "63%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "76%": {
    "opacity": "1"
   },
   "80%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kf0_4",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "79%": {
    "opacity": "0"
   },
   "83%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-ks1",
  "frames": {
   "0%": {
    "left": "544.9px",
    "top": "615.2px",
    "height": "49.6px",
    "opacity": "1"
   },
   "16%": {
    "left": "544.9px",
    "top": "615.2px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "23%": {
    "left": "531.7px",
    "top": "592.1px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "36%": {
    "left": "531.7px",
    "top": "592.1px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "43%": {
    "left": "495.3px",
    "top": "570.6px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "56%": {
    "left": "495.3px",
    "top": "570.6px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "63%": {
    "left": "506.9px",
    "top": "588.8px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "76%": {
    "left": "506.9px",
    "top": "588.8px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "83%": {
    "left": "379.7px",
    "top": "486.3px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "100%": {
    "left": "379.7px",
    "top": "486.3px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   }
  }
 },
 {
  "target": ".a-kf1_0",
  "frames": {
   "0%": {
    "opacity": "1"
   },
   "16%": {
    "opacity": "1"
   },
   "20%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kf1_1",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "19%": {
    "opacity": "0"
   },
   "23%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "36%": {
    "opacity": "1"
   },
   "40%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kf1_2",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "39%": {
    "opacity": "0"
   },
   "43%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "56%": {
    "opacity": "1"
   },
   "60%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kf1_3",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "59%": {
    "opacity": "0"
   },
   "63%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "76%": {
    "opacity": "1"
   },
   "80%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kf1_4",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "79%": {
    "opacity": "0"
   },
   "83%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-ks2",
  "frames": {
   "0%": {
    "left": "749.7px",
    "top": "615.2px",
    "height": "49.6px",
    "opacity": "1"
   },
   "16%": {
    "left": "749.7px",
    "top": "615.2px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "23%": {
    "left": "763px",
    "top": "592.1px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "36%": {
    "left": "763px",
    "top": "592.1px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "43%": {
    "left": "693.6px",
    "top": "673px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "56%": {
    "left": "693.6px",
    "top": "673px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "63%": {
    "left": "705.1px",
    "top": "691.2px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "76%": {
    "left": "705.1px",
    "top": "691.2px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "83%": {
    "left": "705.1px",
    "top": "691.2px",
    "height": "49.6px",
    "opacity": "0",
    "ease": "cb:0.77,0,0.175,1"
   },
   "100%": {
    "left": "705.1px",
    "top": "691.2px",
    "height": "49.6px",
    "opacity": "0",
    "ease": "cb:0.77,0,0.175,1"
   }
  }
 },
 {
  "target": ".a-kf2_0",
  "frames": {
   "0%": {
    "opacity": "1"
   },
   "16%": {
    "opacity": "1"
   },
   "20%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kf2_1",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "19%": {
    "opacity": "0"
   },
   "23%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "36%": {
    "opacity": "1"
   },
   "40%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kf2_2",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "39%": {
    "opacity": "0"
   },
   "43%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "56%": {
    "opacity": "1"
   },
   "60%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kf2_3",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "59%": {
    "opacity": "0"
   },
   "63%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "76%": {
    "opacity": "1"
   },
   "80%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-ks3",
  "frames": {
   "0%": {
    "left": "954.6px",
    "top": "532.6px",
    "height": "49.6px",
    "opacity": "1"
   },
   "16%": {
    "left": "954.6px",
    "top": "532.6px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "23%": {
    "left": "954.6px",
    "top": "532.6px",
    "height": "49.6px",
    "opacity": "0",
    "ease": "cb:0.77,0,0.175,1"
   },
   "36%": {
    "left": "954.6px",
    "top": "532.6px",
    "height": "49.6px",
    "opacity": "0",
    "ease": "cb:0.77,0,0.175,1"
   },
   "43%": {
    "left": "891.8px",
    "top": "570.6px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "56%": {
    "left": "891.8px",
    "top": "570.6px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "63%": {
    "left": "903.4px",
    "top": "486.3px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "76%": {
    "left": "903.4px",
    "top": "486.3px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "83%": {
    "left": "915px",
    "top": "486.3px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "100%": {
    "left": "915px",
    "top": "486.3px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   }
  }
 },
 {
  "target": ".a-kf3_0",
  "frames": {
   "0%": {
    "opacity": "1"
   },
   "16%": {
    "opacity": "1"
   },
   "20%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kf3_2",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "39%": {
    "opacity": "0"
   },
   "43%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "56%": {
    "opacity": "1"
   },
   "60%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kf3_3",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "59%": {
    "opacity": "0"
   },
   "63%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "76%": {
    "opacity": "1"
   },
   "80%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kf3_4",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "79%": {
    "opacity": "0"
   },
   "83%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-ks4",
  "frames": {
   "0%": {
    "left": "954.6px",
    "top": "615.2px",
    "height": "49.6px",
    "opacity": "1"
   },
   "16%": {
    "left": "954.6px",
    "top": "615.2px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "23%": {
    "left": "994.3px",
    "top": "592.1px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "36%": {
    "left": "994.3px",
    "top": "592.1px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "43%": {
    "left": "693.6px",
    "top": "468.2px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "56%": {
    "left": "693.6px",
    "top": "468.2px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "63%": {
    "left": "705.1px",
    "top": "486.3px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "76%": {
    "left": "705.1px",
    "top": "486.3px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "83%": {
    "left": "736.5px",
    "top": "486.3px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "100%": {
    "left": "736.5px",
    "top": "486.3px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   }
  }
 },
 {
  "target": ".a-kf4_0",
  "frames": {
   "0%": {
    "opacity": "1"
   },
   "16%": {
    "opacity": "1"
   },
   "20%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kf4_1",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "19%": {
    "opacity": "0"
   },
   "23%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "36%": {
    "opacity": "1"
   },
   "40%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kf4_2",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "39%": {
    "opacity": "0"
   },
   "43%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "56%": {
    "opacity": "1"
   },
   "60%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kf4_3",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "59%": {
    "opacity": "0"
   },
   "63%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "76%": {
    "opacity": "1"
   },
   "80%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kf4_4",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "79%": {
    "opacity": "0"
   },
   "83%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-ks5",
  "frames": {
   "0%": {
    "left": "954.6px",
    "top": "697.8px",
    "height": "49.6px",
    "opacity": "1"
   },
   "16%": {
    "left": "954.6px",
    "top": "697.8px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "23%": {
    "left": "994.3px",
    "top": "674.7px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "36%": {
    "left": "994.3px",
    "top": "674.7px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "43%": {
    "left": "693.6px",
    "top": "775.5px",
    "height": "69.4px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "56%": {
    "left": "693.6px",
    "top": "775.5px",
    "height": "69.4px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "63%": {
    "left": "705.1px",
    "top": "777.1px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "76%": {
    "left": "705.1px",
    "top": "777.1px",
    "height": "49.6px",
    "opacity": "1",
    "ease": "cb:0.77,0,0.175,1"
   },
   "83%": {
    "left": "705.1px",
    "top": "777.1px",
    "height": "49.6px",
    "opacity": "0",
    "ease": "cb:0.77,0,0.175,1"
   },
   "100%": {
    "left": "705.1px",
    "top": "777.1px",
    "height": "49.6px",
    "opacity": "0",
    "ease": "cb:0.77,0,0.175,1"
   }
  }
 },
 {
  "target": ".a-kf5_0",
  "frames": {
   "0%": {
    "opacity": "1"
   },
   "16%": {
    "opacity": "1"
   },
   "20%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kf5_1",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "19%": {
    "opacity": "0"
   },
   "23%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "36%": {
    "opacity": "1"
   },
   "40%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kf5_2",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "39%": {
    "opacity": "0"
   },
   "43%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "56%": {
    "opacity": "1"
   },
   "60%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kf5_3",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "59%": {
    "opacity": "0"
   },
   "63%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "76%": {
    "opacity": "1"
   },
   "80%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kl0",
  "frames": {
   "0%": {
    "opacity": "1"
   },
   "16%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "19%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kd0 .ah",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "3%": {
    "opacity": "0"
   },
   "3.6%": {
    "opacity": "1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-kl1",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "20%": {
    "opacity": "0"
   },
   "23%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "36%": {
    "opacity": "1"
   },
   "39%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kd1 .ah",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "26%": {
    "opacity": "0"
   },
   "26.6%": {
    "opacity": "1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-kl2",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "40%": {
    "opacity": "0"
   },
   "43%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "56%": {
    "opacity": "1"
   },
   "59%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kd2 .ah",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "46%": {
    "opacity": "0"
   },
   "46.6%": {
    "opacity": "1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-kl3",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "60%": {
    "opacity": "0"
   },
   "63%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "76%": {
    "opacity": "1"
   },
   "79%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kd3 .ah",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "66%": {
    "opacity": "0"
   },
   "66.6%": {
    "opacity": "1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-kl4",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "80%": {
    "opacity": "0"
   },
   "83%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-kd4 .ah",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "86%": {
    "opacity": "0"
   },
   "86.6%": {
    "opacity": "1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-kname",
  "frames": {
   "0%": {
    "transform": "translateY(0px)"
   },
   "16%": {
    "transform": "translateY(0px)"
   },
   "22%": {
    "transform": "translateY(-260px)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "36%": {
    "transform": "translateY(-260px)"
   },
   "42%": {
    "transform": "translateY(-520px)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "56%": {
    "transform": "translateY(-520px)"
   },
   "62%": {
    "transform": "translateY(-780px)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "76%": {
    "transform": "translateY(-780px)"
   },
   "82%": {
    "transform": "translateY(-1040px)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "100%": {
    "transform": "translateY(-1040px)"
   }
  }
 },
 {
  "target": ".a-kline0",
  "frames": {
   "0%": {
    "opacity": "1"
   },
   "16%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "19%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kline1",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "20%": {
    "opacity": "0"
   },
   "23%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "36%": {
    "opacity": "1"
   },
   "39%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kline2",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "40%": {
    "opacity": "0"
   },
   "43%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "56%": {
    "opacity": "1"
   },
   "59%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kline3",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "60%": {
    "opacity": "0"
   },
   "63%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "76%": {
    "opacity": "1"
   },
   "79%": {
    "opacity": "0",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-kline4",
  "frames": {
   "0%": {
    "opacity": "0"
   },
   "80%": {
    "opacity": "0"
   },
   "83%": {
    "opacity": "1",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1"
   }
  }
 },
 {
  "target": ".a-kcam",
  "frames": {
   "0%": {
    "transform": "scale(1.3316)"
   },
   "16%": {
    "transform": "scale(1.3316)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "23%": {
    "transform": "scale(1.3316)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "36%": {
    "transform": "scale(1.3316)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "43%": {
    "transform": "scale(1)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "56%": {
    "transform": "scale(1)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "63%": {
    "transform": "scale(1.0866)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "76%": {
    "transform": "scale(1.0866)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "83%": {
    "transform": "scale(1.3316)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "100%": {
    "transform": "scale(1.3316)",
    "ease": "cb:0.77,0,0.175,1"
   }
  }
 },
 {
  "target": ".a-ofcap",
  "frames": {
   "0%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   },
   "30%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   },
   "36%": {
    "opacity": "0",
    "transform": "translateY(-10px)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "100%": {
    "opacity": "0"
   }
  }
 },
 {
  "target": ".a-file",
  "frames": {
   "0%": {
    "opacity": "1",
    "transform": "translate(-346px, 0px) scale(0.94)"
   },
   "16%": {
    "opacity": "1",
    "transform": "translate(-346px, 0px) scale(1)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "40%": {
    "opacity": "1",
    "transform": "translate(-346px, 0px) scale(1)"
   },
   "54%": {
    "opacity": "1",
    "transform": "translate(0px, 0px) scale(1)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translate(0px, 0px) scale(1)"
   }
  }
 },
 {
  "target": ".a-flights",
  "frames": {
   "0%": {
    "opacity": "1",
    "clipPath": "inset(calc(1200px - var(--by, 0px)) calc(2400px - var(--bx, 0px)) calc(1200px - var(--by, 0px)) calc(2400px - var(--bx, 0px)) round 0px)"
   },
   "16%": {
    "opacity": "1",
    "clipPath": "inset(1396px 2954px 1444px 2954px round 20px)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "16.5%": {
    "opacity": "0",
    "clipPath": "inset(1396px 2954px 1444px 2954px round 20px)"
   },
   "100%": {
    "opacity": "0",
    "clipPath": "inset(1396px 2954px 1444px 2954px round 20px)"
   }
  }
 },
 {
  "target": ".a-filein",
  "frames": {
   "0%": {
    "transform": "rotateY(0deg)"
   },
   "20%": {
    "transform": "rotateY(0deg)"
   },
   "35%": {
    "transform": "rotateY(180deg)",
    "ease": "cb:0.77,0,0.175,1"
   },
   "100%": {
    "transform": "rotateY(180deg)"
   }
  }
 },
 {
  "target": ".a-ofh",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateX(-30px)"
   },
   "44%": {
    "opacity": "0",
    "transform": "translateX(-30px)"
   },
   "56%": {
    "opacity": "1",
    "transform": "translateX(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateX(0px)"
   }
  }
 },
 {
  "target": ".a-ofl0",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(10px)"
   },
   "56%": {
    "opacity": "0",
    "transform": "translateY(10px)"
   },
   "62%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   }
  }
 },
 {
  "target": ".a-ofl1",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(10px)"
   },
   "59%": {
    "opacity": "0",
    "transform": "translateY(10px)"
   },
   "65%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   }
  }
 },
 {
  "target": ".a-ofl2",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(10px)"
   },
   "62%": {
    "opacity": "0",
    "transform": "translateY(10px)"
   },
   "68%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   }
  }
 },
 {
  "target": ".a-ofl3",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(10px)"
   },
   "65%": {
    "opacity": "0",
    "transform": "translateY(10px)"
   },
   "71%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   }
  }
 },
 {
  "target": ".a-ofmore",
  "frames": {
   "0%": {
    "opacity": "0",
    "transform": "translateY(10px)"
   },
   "76%": {
    "opacity": "0",
    "transform": "translateY(10px)"
   },
   "84%": {
    "opacity": "1",
    "transform": "translateY(0px)",
    "ease": "cb:0.23,1,0.32,1"
   },
   "100%": {
    "opacity": "1",
    "transform": "translateY(0px)"
   }
  }
 }
];
