import { Router } from "express";
import * as featuresController from "./features.controller";

const router = Router();

router.get("/heatmap", featuresController.getHeatmapData);
router.post("/whistleblower", featuresController.submitWhistleblowerReport);
router.get("/whistleblower", featuresController.getWhistleblowerReports);
router.get("/clone-radar", featuresController.getCloneRadarData);
router.post("/vernacular-check", featuresController.checkVernacularScam);
router.get("/xray", featuresController.getXrayDeepfakes);

export default router;
