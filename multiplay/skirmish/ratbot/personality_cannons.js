
include("/multiplay/skirmish/ratbot/wztypes.js")

///Research path.
var ResearchPath = ["R-Vehicle-Engine01", "R-Wpn-RailGun03", "R-Wpn-Cannon1Mk1", "R-Vehicle-Prop-Halftracks", "R-Struc-Research-Module",
					"R-Struc-Research-Upgrade09", "R-Vehicle-Body05",
					"R-Wpn-Cannon4AMk1", "R-Wpn-Cannon3Mk1", "R-Struc-Factory-Upgrade01", "R-Vehicle-Body11", "R-Struc-RepairFacility",
					"R-Vehicle-Metals04", "R-Cyborg-Hvywpn-Mcannon", "R-Cyborg-Metals04",
					"R-Struc-Factory-Upgrade09", "R-Wpn-MG2Mk1"];

///Expanded research path triggered when a piece of tech becomes available.
var ResearchStages = new Array(
					new ResearchStage("R-Cyborg-Hvywpn-Mcannon", ["R-Wpn-RailGun03", "R-Vehicle-Body09", "R-Cyborg-Hvywpn-HPV",
									"R-Wpn-Cannon-ROF02", "R-Struc-Power-Upgrade03a", "R-Struc-Factory-Upgrade09", "R-Sys-Sensor-Upgrade02",
									"R-Cyborg-Metals09","R-Vehicle-Metals09"]),
					new ResearchStage("R-Wpn-Rail-Damage02", ["R-Cyborg-Hvywpn-RailGunner", "R-Vehicle-Prop-Tracks", "R-Vehicle-Body10",
									"R-Sys-Autorepair-General", "R-Struc-Materials09", "R-Sys-Sensor-UpLink"])
					);


///Truck templates. We just iterate through these.
var TruckTemplates = new Array(
				[body_Retaliation, prop_Tracks, "Spade1Mk1"],
				[body_Bug, prop_Tracks, "Spade1Mk1"],
				[body_Viper, prop_Halftracks, "Spade1Mk1"],
				[body_Viper, prop_Wheels, "Spade1Mk1"]);

///Tank pre-templates.
var AT_TankTemplates = new Array(
				[body_Vengeance, prop_Tracks, "RailGun3Mk1"],
				[body_Tiger, prop_Halftracks, "RailGun3Mk1"],
				[body_Tiger, prop_Halftracks, "RailGun2Mk1"],
				[body_Mantis, prop_Tracks, "RailGun2Mk1"],
				[body_Tiger, prop_Halftracks, "RailGun1Mk1"],
				[body_Mantis, prop_Tracks, "RailGun1Mk1"],
				[body_Python, prop_Halftracks, "RailGun1Mk1"],
				[body_Tiger, prop_Halftracks, "Cannon6TwinAslt"],
				[body_Mantis, prop_Tracks, "Cannon6TwinAslt"],
				[body_Python, prop_Halftracks, "Cannon6TwinAslt"],
				[body_Python, prop_Wheels, "Cannon375mmMk1"],
				[body_Mantis, prop_Halftracks, "Cannon375mmMk1"],
				[body_Mantis, prop_Tracks, "Cannon4AUTOMk1"],
				[body_Python, prop_Halftracks, "Cannon2A-TMk1"],
				[body_Cobra, prop_Halftracks, "Cannon4AUTOMk1"],
				[body_Cobra, prop_Halftracks, "Cannon2A-TMk1"],
				[body_Cobra, prop_Halftracks, "Cannon1Mk1"],
				[body_Viper, prop_Halftracks, "Cannon1Mk1"],
				[body_Viper, prop_Wheels, "Cannon1Mk1"]);
				
var AP_TankTemplates = new Array(
				[body_Vengeance, prop_Tracks, "Laser2PULSEMk1"],
				[body_Vengeance, prop_Tracks, "MG5TWINROTARY"],
				[body_Tiger, prop_Halftracks, "MG5TWINROTARY"],
				[body_Mantis, prop_Tracks, "MG5TWINROTARY"],
				[body_Python, prop_Halftracks, "MG5TWINROTARY"],
				[body_Tiger, prop_Halftracks, "MG4ROTARYMk1"],
				[body_Mantis, prop_Tracks, "MG4ROTARYMk1"],
				[body_Python, prop_Halftracks, "MG4ROTARYMk1"],
				[body_Python, prop_Halftracks, "MG3Mk1"],
				[body_Cobra, prop_Halftracks, "MG3Mk1"],
				[body_Viper, prop_Halftracks, "MG3Mk1"],
				[body_Cobra, prop_Halftracks, "MG2Mk1"],
				[body_Viper, prop_Halftracks, "MG2Mk1"],
				[body_Viper, prop_Wheels, "MG2Mk1"],
				[body_Viper, prop_Halftracks, "MG1Mk1"],
				[body_Viper, prop_Wheels, "MG1Mk1"]);

var AT_BorgTemplates = new Array(
	["CyborgLightBody", "CyborgLegs", "Cyb-Hvywpn-RailGunner"], 
	["CyborgLightBody", "CyborgLegs", "Cyb-Wpn-Rail1"],
	["CyborgLightBody", "CyborgLegs", "Cyb-Hvywpn-HPV"],
	["CyborgLightBody", "CyborgLegs", "Cyb-Hvywpn-Mcannon"],
	["CyborgLightBody", "CyborgLegs", "CyborgCannon"]);

var AP_BorgTemplates = new Array(
	["CyborgLightBody", "CyborgLegs", "Cyb-Hvywpn-PulseLsr"],
	["CyborgLightBody", "CyborgLegs", "Cyb-Wpn-Laser"],
	["CyborgLightBody", "CyborgLegs", "CyborgRotMG"],
	["CyborgLightBody", "CyborgLegs", "CyborgChaingun"]);
		
var Ratios = new Array(
					new UnitRatio("R-Cyborg-Hvywpn-Mcannon", 100.0, 100.0), //Superborg and up, pure AT
					new UnitRatio("R-Wpn-Cannon4AMk1", 100.0, 0.0), //In case med cannon comes before hpv etc
					new UnitRatio("R-Wpn-Cannon2Mk1", 100.0, 0.0), //Medium cannon and up, pure cannon tanks, pure mg borgs
					new UnitRatio("R-Wpn-Cannon3Mk1", 100.0, 0.0), //Medium cannon and up, pure cannon tanks, pure mg borgs
					new UnitRatio("R-Wpn-Cannon1Mk1", 50.0, 50.0) //With light cannon, 50/50 tanks and 50/50 borgs
					);

include("/multiplay/skirmish/ratbot/main.js")
