import "./style.css";
import { initKonamiCode } from "./features/catsAndDogs";
import { initPets } from "./features/pets";
import { initPsychicMeter } from "./features/psychicMeter";
import { initFavorites, initHitCounter, initTitleScroller, initWavyText } from "./features/retro";
import { initSparkleTrail } from "./features/sparkles";
import { initSpirits } from "./features/spirits";
import { initStarfield } from "./features/starfield";
import { initTaskbar } from "./features/taskbar";
import { initWindows } from "./features/windows";

initStarfield();
initWindows();
initTaskbar(); // after initWindows: the Start menu lists the windows
initHitCounter();
initTitleScroller();
initFavorites();
initWavyText();
initPets();
initSparkleTrail();
initKonamiCode();
initSpirits();
initPsychicMeter();
