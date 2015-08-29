/* RatBot, by Subsentient.
 * Public domain.
 */

///Propulsions
const prop_Wheels = "wheeled01";
const prop_Halftracks = "HalfTrack";
const prop_Tracks = "tracked01";
const prop_Hover = "hover01";
const prop_Vtol = "V-Tol";

///Bodies.
const body_Dragon = "Body14SUP";
const body_Wyvern = "Body13SUP";
const body_Vengeance = "Body10MBT";
const body_Tiger = "Body9REC";
const body_Retribution = "Body7ABT";
const body_Panther = "Body6SUPP";
const body_Mantis = "Body12SUP";
const body_Python = "Body11ABT";
const body_Scorpion = "Body8MBT";
const body_Retaliation = "Body3MBT";
const body_Cobra = "Body5REC";
const body_Leopard = "Body2SUP";
const body_Bug = "Body4ABT";
const body_Viper = "Body1REC";


///Base structures.
const baseStruct_CC = "A0CommandCentre";
const baseStruct_Factory = "A0LightFactory";
const baseStruct_Research =  "A0ResearchFacility";
const baseStruct_Derrick = "A0ResourceExtractor";
const baseStruct_Generator = "A0PowerGenerator";
const baseStruct_BorgFac = "A0CyborgFactory";
const baseStruct_VtolFac = "A0VTolFactory1";

const Module_Factory = "A0FacMod1";
const Module_Research = "A0ResearchModule1";
const Module_Generator = "A0PowMod1";

const OilPool = "OilResource";

///Research path.
var ResearchPath = ["R-Vehicle-Prop-Halftracks", "R-Vehicle-Body05", "R-Struc-Research-Upgrade09","R-Wpn-Cannon4AMk1","R-Wpn-RailGun03",
					"R-Vehicle-Metals02", "R-Wpn-Cannon6TwinAslt", "R-Cyborg-Metals04", "R-Cyborg-Hvywpn-Acannon", "R-Vehicle-Body09",
					"R-Cyborg-Metals09","R-Vehicle-Metals09", "R-Struc-Factory-Upgrade09", "R-Struc-Power-Upgrade03a", "R-Wpn-MG4" ];



///Truck templates.
var TruckTemplates = new Array(
				[body_Retaliation, prop_Tracks, "Spade1Mk1"],
				[body_Bug, prop_Tracks, "Spade1Mk1"],
				[body_Viper, prop_Halftracks, "Spade1Mk1"],
				[body_Viper, prop_Wheels, "Spade1Mk1"]);

///Tank templates.
var TankTemplates = new Array(
				[body_Vengeance, prop_Tracks, "RailGun3Mk1"],
				[body_Tiger, prop_Halftracks, "RailGun3Mk1"],
				[body_Tiger, prop_Halftracks, "RailGun2Mk1"],
				[body_Mantis, prop_Tracks, "RailGun2Mk1"],
				[body_Tiger, prop_Halftracks, "RailGun1Mk1"],
				[body_Mantis, prop_Tracks, "RailGun1Mk1"],
				[body_Mantis, prop_Tracks, "Cannon6TwinAslt"],
				[body_Python, prop_Halftracks, "Cannon6TwinAslt"],
				[body_Mantis, prop_Halftracks, "Cannon375mmMk1"],
				[body_Python, prop_Halftracks, "Cannon375mmMk1"],
				[body_Mantis, prop_Tracks, "Cannon5VulcanMk1"],
				[body_Python, prop_Halftracks, "Cannon5VulcanMk1"],
				[body_Mantis, prop_Tracks, "Cannon4AUTOMk1"],
				[body_Python, prop_Halftracks, "Cannon4AUTOMk1"],
				[body_Python, prop_Halftracks, "Cannon2A-TMk1"],
				[body_Cobra, prop_Halftracks, "Cannon4AUTOMk1"],
				[body_Cobra, prop_Halftracks, "Cannon2A-TMk1"],
				[body_Cobra, prop_Halftracks, "Cannon1Mk1"],
				[body_Viper, prop_Halftracks, "Cannon1Mk1"],
				[body_Viper, prop_Wheels, "Cannon1Mk1"],
				[body_Viper, prop_Halftracks, "MG1Mk1"],
				[body_Viper, prop_Wheels, "MG1Mk1"]);
				
///Borg templates.
var BorgTemplates = new Array(
				["Cyb-Hvybod-RailGunner", "CyborgLegs", "Cyb-Hvywpn-RailGunner"], 
				["Cyb-Bod-Rail1", "CyborgLegs", "Cyb-Wpn-Rail1"],
				["Cyb-Hvybod-Acannon", "CyborgLegs", "Cyb-Hvywpn-Acannon"],
				["Cyb-Hvybod-HPV", "CyborgLegs", "Cyb-Hvywpn-HPV"],
				["Cyb-Hvybod-Mcannon", "CyborgLegs", "Cyb-Hvywpn-Mcannon"],
				["CyborgRkt1Ground", "CyborgLegs", "CyborgRocket"],
				["CyborgChain1Ground", "CyborgLegs", "CyborgChaingun"]);
				
				
///Limits.
const Limit_PGen = 10;
const Limit_Res = 5;
const Limit_Fac = 5;
const Limit_BFac = 5;
const Limit_VFac = 5;
const Limit_CC = 1;


///Fixes a bug.
const DROID_CYBORG_CONSTRUCT = 10;

function MakeBorgs()
{
	var BorgFacs = enumStruct(me, baseStruct_BorgFac);
	
	var TankFacs = enumStruct(me, baseStruct_Factory);
	
	if (BorgFacs.length > 0 && !TankFacs.length && CountTrucks() < 5 && MakeTrucks(true))
	{
		return;
	}
	
	for (Fac in BorgFacs)
	{
		if (!structureIdle(BorgFacs[Fac])) continue;
		
		//With borgs our production must be done differently.
		for (Borg in BorgTemplates)
		{
			if (buildDroid(BorgFacs[Fac], "Borg", BorgTemplates[Borg][0], BorgTemplates[Borg][1], "", DROID_CYBORG, BorgTemplates[Borg][2]))
			{
				break;
			}
		}
	}
}

function TruckBusy(Truck)
{
	switch (Truck.order)
	{
		case DORDER_BUILD:
		case DORDER_HELPBUILD:
		case DORDER_LINEBUILD:
			return true;
		default:
			return false;
	}
}

function CountTrucks()
{
	var Trucks = enumDroid(me, DROID_CONSTRUCT);
	var BorgTrucks = enumDroid(me, DROID_CYBORG_CONSTRUCT);
	var Len = 0;
	
	if (Trucks) Len += Trucks.length;
	if (BorgTrucks) Len += BorgTrucks.length;
	
	return Len;
}

function FindTrucks(Requested, StealOk)
{ //Find Requested number of idle trucks.
	var TruckList = [];
	
	var KnownTrucks = enumDroid(me, DROID_CONSTRUCT);
	var KnownBorgTrucks = enumDroid(me, DROID_CYBORG_CONSTRUCT);
	var Known = KnownTrucks.concat(KnownBorgTrucks);
	
	for (var Inc = 0; Inc < Known.length; ++Inc)
	{
		if (TruckBusy(Known[Inc]) && !StealOk) continue;
		
		TruckList.push(Known[Inc]);
		
		if (Requested != undefined && TruckList.length == Requested) break;
	}
	
	if (!TruckList.length) return null;
	
	return TruckList;
}

function OrderModuleBuild(BaseStructure)
{
	var Module;
	var TrucksWeWant = 0;
	//Determine what we are going to build.
	switch (BaseStructure.stattype)
	{
		case FACTORY:
			Module = Module_Factory;
			TrucksWeWant = 5;
			break;
		case RESEARCH_LAB:
			Module = Module_Research;
			TrucksWeWant = 4;
			break;
		case POWER_GEN:
			Module = Module_Generator;
			TrucksWeWant = 2;
			break;
		default:
			return false;
	}
	
	var Truckles = FindTrucks(TrucksWeWant, false);
	
	if (Truckles == null) return false;
	
	for (var Inc = 0; Inc < Truckles.length; ++Inc)
	{
		orderDroidStatsLoc(Truckles[Inc], DORDER_BUILD, Module, BaseStructure.x, BaseStructure.y);
	}
	
	return true;
	
}

function SortByProximityToBase(Object1, Object2)
{ //Ripped off from the semperfi JS
	var One = distBetweenTwoPoints(startPositions[me].x, startPositions[me].y, Object1.x, Object1.y);
	var Two = distBetweenTwoPoints(startPositions[me].x, startPositions[me].y, Object2.x, Object2.y);
	return One - Two;
}

function FindClosestTruck(Target, StealOk)
{
	var Trucky;
	var Closest = Infinity;
	var Distance;
	
	var TruckList = enumDroid(me, DROID_CONSTRUCT);
	var BorgTruckList = enumDroid(me, DROID_CYBORG_CONSTRUCT);
	var List = TruckList.concat(BorgTruckList);
	
	
	if (!List) return null;
	
	for (var Inc = 0; Inc < List.length; ++Inc)
	{
		if (TruckBusy(List[Inc]) && !StealOk) continue;
		 
		Distance = distBetweenTwoPoints(Target.x, Target.y, List[Inc].x, List[Inc].y);
		
		if (Distance < Closest)
		{
			Closest = Distance;
			Trucky = List[Inc];
		}
	}
	
	return Trucky;
}
		
function BuildOils()
{
	var Oils = enumFeature(-1, OilPool);
	
	if (Oils.length < 1)
	{
		return false;
	}
	
	//Oils.sort(SortOils);
	
	for (var Inc = 0; Inc < Oils.length; ++Inc)
	{
		if (30 >= distBetweenTwoPoints(startPositions[me].x, startPositions[me].y, Oils[Inc].x, Oils[Inc].y))
		{	
			
			var Trucky = FindClosestTruck(Oils[Inc], false);
			
			if (Trucky == null) return false;
			
			
			orderDroidStatsLoc(Trucky, DORDER_BUILD, baseStruct_Derrick, Oils[Inc].x, Oils[Inc].y);
			return true;
		
		}
	}
	
	return false;
}

function OrderBaseBuild(StructureType)
{
	var Truckles = FindTrucks(3, false);
	
	if (!Truckles) return false;
	
	var Location = pickStructLocation(Truckles[0], StructureType, startPositions[me].x, startPositions[me].y, 0);
	
	if (!Location) return false;
	
	for (var Inc = 0; Inc < Truckles.length; ++Inc)
	{
		orderDroidStatsLoc(Truckles[Inc], DORDER_BUILD, StructureType, Location.x, Location.y);
	}
	
	return true;
}

function eventStructureBuilt(Struct, Droid)
{
}

function MakeTrucks(IsBorgFac)
{
	var Trucks = enumDroid(me, DROID_CONSTRUCT);
	var TruckNum = CountTrucks();
	
	if (TruckNum >= 15) return false;
	
	var Facs;
	
	if (IsBorgFac)
	{
		Facs = enumStruct(me, baseStruct_BorgFac);
	}
	else
	{
		Facs = enumStruct(me, baseStruct_Factory);
	}
	
	for (var Inc = 0; Inc < Facs.length && Inc < 15 - Trucks.length; ++Inc)
	{
		if (!structureIdle(Facs[Inc])) continue;
		
		if (IsBorgFac)
		{
			if (buildDroid(Facs[Inc], "Combat Engineer", "Cyb-Bod-ComEng", "CyborgLegs", "", DROID_CYBORG_CONSTRUCT, "CyborgSpade"))
			{
				debug("Queued combat engineer.");
				continue;
			}
			else
			{
				debug("Failed to build combat engineer.");
				break;
			}
		}
		
		for (Trucky in TruckTemplates)
		{
			if (buildDroid(Facs[Inc], "Truck", TruckTemplates[Trucky][0], TruckTemplates[Trucky][1], "", DROID_CONSTRUCT, TruckTemplates[Trucky][2]))
			{
				break;
			}
		}
	}
	
	return true;
}

function MakeTanks()
{
	//Make trucks if we don't have enough.
	if (MakeTrucks(false)) return;
	
	var CC = enumStruct(me, baseStruct_CC);
	
	//Don't make tanks if we don't have a command center.
	if (!CC.length) return;
	
	var Facs = enumStruct(me, baseStruct_Factory);
	
	if (Facs == null) return;
	
	for (Fac in Facs)
	{
		if (!structureIdle(Facs[Fac])) continue;
		
		for (Tank in TankTemplates)
		{
			if (buildDroid(Facs[Fac], "Tank", TankTemplates[Tank][0], TankTemplates[Tank][1], "", DROID_WEAPON, TankTemplates[Tank][2]))
			{
				break;
			}
		}
	}
}

function eventGameInit()
{
}

function ResearchSomething(Lab)
{
	var Worked = false;
	
	if (!structureIdle(Lab)) return;
	
	for (Item in ResearchPath)
	{
		if ((Worked = pursueResearch(Lab, ResearchPath[Item]))) break;
	}
}

function DoAllResearch()
{
	var Researches = enumStruct(me, RESEARCH_LAB);
	
	for (Res in Researches)
	{
		ResearchSomething(Researches[Res]);
	}
}


function WorkOnBase()
{
	var Researches = enumStruct(me, baseStruct_Research);
	var Generators = enumStruct(me, baseStruct_Generator);
	var Factories = enumStruct(me, baseStruct_Factory);
	var BorgFacs = enumStruct(me, baseStruct_BorgFac);
	var CC = enumStruct(me, baseStruct_CC);	
	
	//Basic stuff just to get us going
	if (Researches.length < 3)
	{
		OrderBaseBuild(baseStruct_Research);
	}
	else if (Factories.length < 2)
	{
		OrderBaseBuild(baseStruct_Factory);

	}
	
	BuildOils();
	
	//More automated base building
	if (Generators.length < 4)
	{
		OrderBaseBuild(baseStruct_Generator);
	}
	else if (Researches.length < Limit_Res)
	{
		OrderBaseBuild(baseStruct_Research);
	}
	else if (CC.length < Limit_CC)
	{
		OrderBaseBuild(baseStruct_CC);
	}
	else if (Generators.length < Limit_PGen)
	{
		OrderBaseBuild(baseStruct_Generator);
	}
	else if (Factories.length < Limit_Fac)
	{
		OrderBaseBuild(baseStruct_Factory);
	}
	
	//Get borg facs up
	if (isStructureAvailable(baseStruct_BorgFac, me) && BorgFacs.length < Limit_BFac)
	{
		OrderBaseBuild(baseStruct_BorgFac);
	}
	
	///Modules.
	if (isStructureAvailable(Module_Research, me))
	{
		//Researches
		for (var Inc = 0; Inc < Researches.length; ++Inc)
		{
			if (!Researches[Inc].modules)
			{
				OrderModuleBuild(Researches[Inc]);
			}
		}
	}
	
	if (isStructureAvailable(Module_Factory, me))
	{
		//Factories
		for (var Inc = 0; Inc < Factories.length; ++Inc)
		{
			if (Factories[Inc].modules < 2)
			{
				OrderModuleBuild(Factories[Inc]);
			}
		}
	}
	
	if (isStructureAvailable(Module_Generator, me))
	{
		//Generators.
		for (var Inc = 0; Inc < Generators.length; ++Inc)
		{
			if (!Generators[Inc].modules)
			{
				OrderModuleBuild(Generators[Inc]);
			}
		}
	}
}

function eventStartLevel()
{
	setTimer("DoAllResearch", 500);
	setTimer("MakeTanks", 500);
	setTimer("MakeBorgs", 500);
	setTimer("WorkOnBase", 500);
}


function eventDroidBuilt(droid, fac1)
{
}


function eventAttacked(Target, Attacker)
{

	if (Target.type != STRUCTURE) return;
	
	var Droids = enumDroid(me, DROID_ANY);
	
	for (Droid in Droids)
	{
		//No trucks in the line of fire plz.
		if (Droids[Droid].droidType == DROID_CONSTRUCT || Droids[Droid].droidType == DROID_CYBORG_CONSTRUCT) continue;
		
		//Send him to battle.
		orderDroidLoc(Droids[Droid], DORDER_MOVE, Attacker.x, Attacker.y);
	}
}

