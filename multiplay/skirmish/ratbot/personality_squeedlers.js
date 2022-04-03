
include("/multiplay/skirmish/ratbot/wztypes.js")


///Research path.
var ResearchPath = ["R-Struc-Research-Upgrade09", "R-Wpn-MG5", "R-Wpn-MG-Damage08", "R-Vehicle-Prop-Tracks",
					"R-Vehicle-Body04", "R-Wpn-Laser02", "R-Struc-Power-Upgrade03a", 
					"R-Struc-Factory-Upgrade04", "R-Struc-RepairFacility",
					"R-Vehicle-Metals04", "R-Cyborg-Metals04", "R-Sys-Sensor-Upgrade03",
					"R-Defense-RotMG"];

///Expanded research path triggered when a piece of tech becomes available.
var ResearchStages = new Array	(
									new ResearchStage("R-Wpn-MG4", ["R-Struc-Factory-Upgrade09",
													"R-Cyborg-Metals09", "R-Vehicle-Metals09"]),
									new ResearchStage("R-Struc-Research-Upgrade06", ["R-Cyborg-Hvywpn-PulseLsr", "R-Sys-Autorepair-General", "R-Struc-Materials09", "R-Sys-Sensor-UpLink",
													"R-Wpn-Energy-ROF03", "R-Wpn-Energy-Damage03"])
								);


///Truck templates. We just iterate through these.
var TruckTemplates = new Array(
				[body_Bug, prop_Tracks, "Spade1Mk1"],
				[body_Viper, prop_Halftracks, "Spade1Mk1"],
				[body_Viper, prop_Wheels, "Spade1Mk1"]);

///Tank pre-templates.
var AT_TankTemplates = new Array();
				
var AP_TankTemplates = new Array(
				[body_Bug, prop_Tracks, "Laser2PULSEMk1"],
				[body_Bug, prop_Tracks, "MG5TWINROTARY"],
				[body_Bug, prop_Tracks, "MG4ROTARYMk1"],
				[body_Bug, prop_Tracks, "MG3Mk1"],
				[body_Bug, prop_Halftracks, "MG3Mk1"],
				[body_Viper, prop_Halftracks, "MG3Mk1"],
				[body_Viper, prop_Halftracks, "MG2Mk1"],
				[body_Viper, prop_Wheels, "MG2Mk1"],
				[body_Viper, prop_Halftracks, "MG1Mk1"],
				[body_Viper, prop_Wheels, "MG1Mk1"]);

var AT_BorgTemplates = new Array();

var AP_BorgTemplates = new Array(
	["CyborgLightBody", "CyborgLegs", "Cyb-Hvywpn-PulseLsr"],
	["CyborgLightBody", "CyborgLegs", "Cyb-Wpn-Laser"],
	["CyborgLightBody", "CyborgLegs", "CyborgRotMG"],
	["CyborgLightBody", "CyborgLegs", "CyborgChaingun"]);
		
var Ratios = new Array	(
							new UnitRatio("R-Wpn-MG1Mk1", 0.0, 0.0),//This is a squeedler bot, so obviously squeedlers all the way.
						);
include("/multiplay/skirmish/ratbot/main.js")
