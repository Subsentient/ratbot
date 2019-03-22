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

///Limits.
const Limit_PGen = 10;
const Limit_Res = 5;
const Limit_Fac = 5;
const Limit_BFac = 5;
const Limit_VFac = 5;
const Limit_CC = 1;


///How many tiles away an oil has to be before we will NOT build it.
const MaxOilDistance = 20;
const MaxWatchingDistance = 35;

var OilTrucks; //The numeric group ID.
var NonOilTrucks; //Hack because I can't find another way to un-group trucks.

///Bug fixes. All of these came from nullbot.
const DROID_CYBORG_CONSTRUCT = 10;
const COMP_PROPULSION = 3;
const COMP_BODY = 1;
const COMP_WEAPON = 8;

var TrucksBeingMade = 0; //The number of trucks currently in production.
var HadExtraTrucks = false; //If we started with more than 15 trucks, as some maps do.

/**//*AFTER THIS IS STUFF THAT CAN CHANGE.*//**/


///Research path.
var ResearchPath = ["R-Vehicle-Engine01", "R-Wpn-Cannon1Mk1", "R-Vehicle-Prop-Halftracks", "R-Vehicle-Body05", "R-Vehicle-Body11", "R-Struc-Research-Upgrade09","R-Wpn-Cannon4AMk1",
					"R-Wpn-RailGun03", "R-Wpn-Cannon6TwinAslt", "R-Vehicle-Metals04", "R-Cyborg-Metals04", "R-Cyborg-Hvywpn-Mcannon",
					"R-Wpn-MG2Mk1" ];

///Expanded research path triggered when a piece of tech becomes available.
var ResearchStages = new Array(
					new ResearchStage("R-Cyborg-Hvywpn-Mcannon", ["R-Vehicle-Body09", "R-Cyborg-Hvywpn-Acannon", "R-Struc-Power-Upgrade03a",
									"R-Struc-Factory-Upgrade09", "R-Cyborg-Metals09","R-Vehicle-Metals09"]),
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
				["Cyb-Hvybod-RailGunner", "CyborgLegs", "Cyb-Hvywpn-RailGunner"], 
				["Cyb-Bod-Rail1", "CyborgLegs", "Cyb-Wpn-Rail1"],
				["Cyb-Hvybod-Acannon", "CyborgLegs", "Cyb-Hvywpn-Acannon"],
				["Cyb-Hvybod-HPV", "CyborgLegs", "Cyb-Hvywpn-HPV"],
				["Cyb-Hvybod-Mcannon", "CyborgLegs", "Cyb-Hvywpn-Mcannon"],
				["CyborgCannonGrd", "CyborgLegs", "CyborgCannon"]);

var AP_BorgTemplates = new Array(
				["Cyb-Hvybod-PulseLsr", "CyborgLegs", "Cyb-Hvywpn-PulseLsr"],
				["Cyb-Bod-Las1", "CyborgLegs", "Cyb-Wpn-Laser"],
				["CybRotMgGrd", "CyborgLegs", "CyborgRotMG"],
				["CyborgChain1Ground", "CyborgLegs", "CyborgChaingun"]);

///Borg templates for v3.2+

if(version != "3.1"){
	AT_BorgTemplates = new Array(
		["CyborgLightBody", "CyborgLegs", "Cyb-Hvywpn-RailGunner"], 
		["CyborgLightBody", "CyborgLegs", "Cyb-Wpn-Rail1"],
		["CyborgLightBody", "CyborgLegs", "Cyb-Hvywpn-Acannon"],
		["CyborgLightBody", "CyborgLegs", "Cyb-Hvywpn-HPV"],
		["CyborgLightBody", "CyborgLegs", "Cyb-Hvywpn-Mcannon"],
		["CyborgLightBody", "CyborgLegs", "CyborgCannon"]);

	AP_BorgTemplates = new Array(
		["CyborgLightBody", "CyborgLegs", "Cyb-Hvywpn-PulseLsr"],
		["CyborgLightBody", "CyborgLegs", "Cyb-Wpn-Laser"],
		["CyborgLightBody", "CyborgLegs", "CyborgRotMG"],
		["CyborgLightBody", "CyborgLegs", "CyborgChaingun"]);
}
var Ratios = new Array(
					new UnitRatio("R-Cyborg-Hvywpn-Mcannon", [0], null, [0], null, 1, 1), //Superborg and up, pure AT
					new UnitRatio("R-Wpn-Cannon4AMk1", [0], null, [0], [1], 1, 2), //In case med cannon comes before hpv etc
					new UnitRatio("R-Wpn-Cannon2Mk1", [0], null, [0], [1], 1, 2), //Medium cannon and up, pure cannon tanks, 50/50 borgs
					new UnitRatio("R-Wpn-Cannon1Mk1", [0], [1], [0], [1], 2, 2) //With light cannon, 50/50 tanks and 50/50 borgs
					);

var CurrentRatio = new UnitRatio(null, null, [0], null, [0], 1, 1); //Trigger weapon doesn't matter for the first ratio.



function UnitRatio(Trigger, TankAT, TankAP, BorgAT, BorgAP, TankLimit, BorgLimit)
{
	this.Trigger = Trigger; //The weapon that triggers the unit ratio update.
	this.TankAT = TankAT; //The numbers that will occur in TankLimit and BorgLimit that indicate we want an AT unit.
	this.TankAP = TankAP; //The numbers that will occur in TankLimit and BorgLimit that indicate we want an AP unit.
	this.BorgAT = BorgAT; // ^ See above
	this.BorgAP = BorgAP;
	this.TankLimit = TankLimit; //The number of "cycles" we're going to use to produce the desired ratio of AT to AP units.
	this.BorgLimit = BorgLimit; //Same as above but for borgs.
	
	//This stuff is what we increment, which we reset to zero when TankLimit or BorgLimit is reached.
	this.TankInc = 0;
	this.BorgInc = 0;
}

function ResearchStage(Trigger, TechArray)
{
	this.Trigger = Trigger;
	this.TechArray = TechArray;
	this.Appended = false;
}

function ManageResearchStages()
{
	for (S in ResearchStages)
	{
		if (ResearchStages[S].Appended) continue;
		
		var Res = getResearch(ResearchStages[S].Trigger);
		
		if (Res.done)
		{
			ResearchPath = ResearchPath.concat(ResearchStages[S].TechArray);
			ResearchStages[S].Appended = true;
			return;
		}
	}
}

function WatchForEnemies()
{
	for (var Inc = 0; Inc < maxPlayers; ++Inc)
	{
		if (allianceExistsBetween(me, Inc) || Inc == me) continue;
		
		var EnemyDroids = enumDroid(Inc, DROID_ANY);
		
		if (!EnemyDroids) continue;
		
		for (D in EnemyDroids)
		{
			if (MaxWatchingDistance > distBetweenTwoPoints(startPositions[me].x, startPositions[me].y, EnemyDroids[D].x, EnemyDroids[D].y))
			{ //ALERT! Someone is near us!
				var Droids = enumDroid(me, DROID_ANY);
				
				if (!Droids || !Droids.length) return;
				
				if (!droidCanReach(Droids[0], EnemyDroids[D].x, EnemyDroids[D].y)) continue;
				
				for (D2 in Droids)
				{
					if (Droids[D2].droidType == DROID_CONSTRUCT || Droids[D2].droidType == DROID_CYBORG_CONSTRUCT) continue;
					
					orderDroidLoc(Droids[D2], DORDER_MOVE, EnemyDroids[D].x, EnemyDroids[D].y);
				}
				return;
			}
		}
		
		//We don't watch for structures, because that's expensive and we can simply respond to arty attacks.
	}
}

function ChooseEnemy()
{
	var Enemies = [];
	
	
	//Enumerate all enemies we have.
	for (var Inc = 0; Inc < maxPlayers; ++Inc)
	{
		var EnemyStructs = enumCriticalStructs(Inc);
		var EnemyDroids = enumDroid(Inc);
		
		var OurDroids = enumDroid(me, DROID_ANY);
		
		if ((EnemyDroids.length || EnemyStructs.length) && !allianceExistsBetween(me, Inc) &&
			Inc != me && droidCanReach(OurDroids[0], startPositions[Inc].x, startPositions[Inc].y))
		{
			Enemies.push(Inc);
		}
	}
	
	if (Enemies.length == 0) return null;
	
	
	//Pick the closest one.
	var ClosestDistance = Infinity;
	var ClosestEnemy = null;
	
	for (Enemy in Enemies)
	{
		var NewDistance = distBetweenTwoPoints(startPositions[me].x, startPositions[me].y, startPositions[Enemies[Enemy]].x, startPositions[Enemies[Enemy]].y);
		if (ClosestDistance > NewDistance)
		{
			ClosestDistance = NewDistance;
			ClosestEnemy = Enemies[Enemy];
		}
	}
	
	return ClosestEnemy;
}

function enumCriticalStructs(Player)
{
	var Structs = enumStruct(Player);
	
	var NonDefenseStructs = [];
	
	for (S in Structs)
	{
		switch (Structs[S].stattype)
		{
			case FACTORY:
			case RESEARCH_LAB:
			case CYBORG_FACTORY:
			case VTOL_FACTORY:
				NonDefenseStructs.push(Structs[S]);
				break;
			default:
				break;
		}
	}
	
	return NonDefenseStructs;
}

function PerformAttack()
{
	var Droids = enumDroid(me, DROID_ANY);
	
	//Find an enemy to pwn
	var Target = ChooseEnemy();
	
	if (Target == null) return;
	
	var EnemyDroids = enumDroid(Target, DROID_ANY);
	var EnemyAttackDroids = 0;
	var OurAttackDroids = 0;
	
	for (D in Droids)
	{ //Our attack droids.
		if (Droids[D].droidType == DROID_CYBORG_CONSTRUCT || Droids[D].droidType == DROID_CONSTRUCT) continue;
		++OurAttackDroids;
	}
	
	for (D in EnemyDroids)
	{ //Enemy attack droids.
		if (EnemyDroids[D].droidType == DROID_CYBORG_CONSTRUCT || EnemyDroids[D].droidType == DROID_CONSTRUCT) continue;
		++EnemyAttackDroids;
	}
	
	//Only attack when we got all possible units, or we have 3x as many units as them.
	if (Droids.length != 150 && ((EnemyAttackDroids * 3 > OurAttackDroids) || OurAttackDroids < 20)) return;
	
	var NonDefenseStructs = enumCriticalStructs(Target);

	if (EnemyAttackDroids < 20)
	{ ///They are almost dead, finish them off.
		for (Droid in Droids)
		{
			var AttackStructure = Math.floor(Math.random()*2); //Boolean
			
			if (Droids[Droid].droidType == DROID_CONSTRUCT || Droids[Droid].droidType == DROID_CYBORG_CONSTRUCT) continue;
			
			if (AttackStructure)
			{
				if (!NonDefenseStructs.length) continue;
				var Element = Math.floor(Math.random() * NonDefenseStructs.length);
				orderDroidObj(Droids[Droid], DORDER_ATTACK, NonDefenseStructs[Element]);
			}
			else
			{
				if (!EnemyDroids.length) continue;
				var Element = Math.floor(Math.random() * EnemyDroids.length);
				orderDroidObj(Droids[Droid], DORDER_ATTACK, EnemyDroids[Element]);
			}
		}
	}
	else
	{ ///They got an army, just send a fuckton to their base.
		for (Droid in Droids)
		{
			if (Droids[Droid].droidType == DROID_CONSTRUCT || Droids[Droid].droidType == DROID_CYBORG_CONSTRUCT)
			{
				continue;
			}
			orderDroidLoc(Droids[Droid], DORDER_MOVE, startPositions[Target].x, startPositions[Target].y);
		}
	}
}

function MakeBorgs()
{
	var BorgFacs = enumStruct(me, baseStruct_BorgFac);
	
	var TankFacs = enumStruct(me, baseStruct_Factory);
	
	if (BorgFacs.length > 0 && !TankFacs.length && CountTrucks() < 5 && MakeTrucks(true))
	{
		return;
	}
	
	FactoryLoop:
	for (Fac in BorgFacs)
	{
		if (!structureIdle(BorgFacs[Fac]) || BorgFacs[Fac].status != BUILT) continue;
		
		if (CurrentRatio.BorgInc === CurrentRatio.BorgLimit) CurrentRatio.BorgInc = 0;
		
		for (E in CurrentRatio.BorgAT)
		{
			if (CurrentRatio.BorgInc === CurrentRatio.BorgAT[E])
			{
				for (T in AT_BorgTemplates)
				{
					var TemplateName = AT_BorgTemplates[T][2] + " " + AT_BorgTemplates[T][0] + " " + AT_BorgTemplates[T][1];
					if (buildDroid(BorgFacs[Fac], TemplateName, AT_BorgTemplates[T][0], AT_BorgTemplates[T][1], "", DROID_CYBORG, AT_BorgTemplates[T][2]))
					{
						++CurrentRatio.BorgInc;
						continue FactoryLoop;
					}
				}
				break;
			}
		}
		
		for (E in CurrentRatio.BorgAP)
		{
			if (CurrentRatio.BorgInc === CurrentRatio.BorgAP[E])
			{
				for (T in AP_BorgTemplates)
				{
					var TemplateName = AP_BorgTemplates[T][2] + " " + AP_BorgTemplates[T][0] + " " + AP_BorgTemplates[T][1];
					if (buildDroid(BorgFacs[Fac], TemplateName, AP_BorgTemplates[T][0], AP_BorgTemplates[T][1], "", DROID_CYBORG, AP_BorgTemplates[T][2]))
					{	
						++CurrentRatio.BorgInc;
						break;
					}
				}
				
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

function FinishHalfBuilds()
{
	var Structs = enumStruct(me);
	
	for (S in Structs)
	{
		if (Structs[S].status != BUILT)
		{
			var Trucks = FindTrucks(2, false);
			for (T in Trucks)
			{
				orderDroidObj(Trucks[T], DORDER_HELPBUILD, Structs[S]);
			}
		}
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
		//Don't take oiler trucks.
		if (UnitInGroup(OilTrucks, Known[Inc])) continue;
		
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
		orderDroidBuild(Truckles[Inc], DORDER_BUILD, Module, BaseStructure.x, BaseStructure.y);
	}
	
	return true;
	
}

function SortByProximityToBase(Object1, Object2)
{ //Ripped off from the semperfi JS
	var One = distBetweenTwoPoints(startPositions[me].x, startPositions[me].y, Object1.x, Object1.y);
	var Two = distBetweenTwoPoints(startPositions[me].x, startPositions[me].y, Object2.x, Object2.y);
	return One - Two;
}

function FindClosestInGroup(GroupID, Target, StealOk)
{
	var Group = enumGroup(GroupID);
	var Closest = Infinity;
	var Distance;
	
	var Unit;
	if (!Group) return null;
	
	for (G in Group)
	{
		if (TruckBusy(Group[G]) && !StealOk) continue;
		
		Distance = distBetweenTwoPoints(Target.x, Target.y, Group[G].x, Group[G].y);
		
		if (Distance < Closest)
		{
			Closest = Distance;
			Unit = Group[G];
		}
	}
	
	if (!Unit) return null;
	return Unit;
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
		if (UnitInGroup(OilTrucks, List[Inc])) continue;
		
		if (TruckBusy(List[Inc]) && !StealOk) continue;
		 
		Distance = distBetweenTwoPoints(Target.x, Target.y, List[Inc].x, List[Inc].y);
		
		if (Distance < Closest)
		{
			Closest = Distance;
			Trucky = List[Inc];
		}
	}
	
	if (!Trucky) return null;
	
	return Trucky;
}

function CountGroupSize(GroupID)
{
	var Group = enumGroup(GroupID);
	
	return Group.length;
}

function GrabOilTrucks()
{
	var Droids = enumDroid(me, DROID_ANY);
	var ExistingOilers = enumGroup(OilTrucks);
	
	var Needed = 4 - ExistingOilers;
	
	
	for (D in Droids)
	{
		if (!Needed) return;
		
		if (Droids[D].droidType == DROID_CONSTRUCT || Droids[D].droidType == DROID_CYBORG_CONSTRUCT)
		{
			groupAddDroid(OilTrucks, Droids[D]);
			--Needed;
		}
	}
}

function NeedToBuildOils()
{
	
	var Oils = enumFeature(-1, OilPool);
	
	
	for (O in Oils)
	{
		if (MaxOilDistance >= distBetweenTwoPoints(startPositions[me].x, startPositions[me].y, Oils[O].x, Oils[O].y))
		{
			return true;
		}
	}
	
	return false;
}

		
function BuildOils()
{
	var Oils = enumFeature(-1, OilPool);
	
	if (Oils.length < 1)
	{
		return false;
	}
	
	
	for (var Inc = 0; Inc < Oils.length; ++Inc)
	{
		if (MaxOilDistance >= distBetweenTwoPoints(startPositions[me].x, startPositions[me].y, Oils[Inc].x, Oils[Inc].y))
		{	
			
			var Trucky = FindClosestInGroup(OilTrucks, Oils[Inc], false);
			
			if (Trucky == null) return false;
			
			
			orderDroidBuild(Trucky, DORDER_BUILD, baseStruct_Derrick, Oils[Inc].x, Oils[Inc].y);
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
		orderDroidBuild(Truckles[Inc], DORDER_BUILD, StructureType, Location.x, Location.y);
	}
	
	return true;
}

function eventStructureBuilt(Struct, Droid)
{
}

function MakeTrucks(IsBorgFac)
{
	var Trucks = enumDroid(me, DROID_CONSTRUCT);
	var TruckNum = CountTrucks() + TrucksBeingMade;
	
	if (TruckNum > 15 && !HadExtraTrucks) TrucksBeingMade = 0;
	
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
		if (!structureIdle(Facs[Inc]) || Facs[Inc].status != BUILT) continue;
		
		if (IsBorgFac)
		{
			var _body = "Cyb-Bod-ComEng";
			if(version != "3.1") _body = "CyborgLightBody";
			if (buildDroid(Facs[Inc], "Combat Engineer", _body, "CyborgLegs", "", DROID_CYBORG_CONSTRUCT, "CyborgSpade"))
			{
				++TrucksBeingMade;
				continue;
			}
			else
			{
				break;
			}
		}
		
		for (Trucky in TruckTemplates)
		{
			if (buildDroid(Facs[Inc], "Truck", TruckTemplates[Trucky][0], TruckTemplates[Trucky][1], "", DROID_CONSTRUCT, TruckTemplates[Trucky][2]))
			{
				++TrucksBeingMade;
				break;
			}
		}
	}
	
	return true;
}

function UnitInGroup(GroupID, Droid)
{
	var Group = enumGroup(GroupID);
	
	for (G in Group)
	{
		if (Group[G].id == Droid.id)
		{
			return true;
		}
	}
	
	return false;
}

function MakeTanks()
{
	//Make trucks if we don't have enough.
	if (MakeTrucks(false)) return;
	
	var CC = enumStruct(me, baseStruct_CC);
	
	//Don't make tanks if we don't have a command center.
	if (!CC.length || CC[0].status != BUILT) return;
	
	var Facs = enumStruct(me, baseStruct_Factory);
	
	if (Facs == null) return;
	
	FactoryLoop:
	for (Fac in Facs)
	{
		if (!structureIdle(Facs[Fac]) || Facs[Fac].status != BUILT) continue;
		
		if (CurrentRatio.TankInc === CurrentRatio.TankLimit) CurrentRatio.TankInc = 0;
		
		for (E in CurrentRatio.TankAT)
		{
			if (CurrentRatio.TankInc === CurrentRatio.TankAT[E])
			{
				for (T in AT_TankTemplates)
				{
					var TemplateName = AT_TankTemplates[T][2] + " " + AT_TankTemplates[T][0] + " " + AT_TankTemplates[T][1];
					if (buildDroid(Facs[Fac], TemplateName, AT_TankTemplates[T][0], AT_TankTemplates[T][1], "", DROID_WEAPON, AT_TankTemplates[T][2]))
					{
						++CurrentRatio.TankInc;
						continue FactoryLoop;
					}
				}
				break;
			}
		}
		
		for (E in CurrentRatio.TankAP)
		{
			if (CurrentRatio.TankInc === CurrentRatio.TankAP[E])
			{
				for (T in AP_TankTemplates)
				{
					var TemplateName = AP_TankTemplates[T][2] + " " + AP_TankTemplates[T][0] + " " + AP_TankTemplates[T][1];
					if (buildDroid(Facs[Fac], TemplateName, AP_TankTemplates[T][0], AP_TankTemplates[T][1], "", DROID_WEAPON, AP_TankTemplates[T][2]))
					{	
						++CurrentRatio.TankInc;
						break;
					}
				}
				
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
	
	for (var Inc = 0; Inc < ResearchPath.length; ++Inc)
	{
		if ((Worked = pursueResearch(Lab, ResearchPath[Inc])))
		{
//			debug(me + ":: Research for item " + ResearchPath[Inc] + " started");
			break;
		}
	}
	
	return Worked;
}

function DoAllResearch()
{
	var Researches = enumStruct(me, RESEARCH_LAB);
	
	for (var Inc = 0; Inc < Researches.length; ++Inc)
	{
		if (Researches[Inc].status == BEING_BUILT) continue;

		ResearchSomething(Researches[Inc]);
	}
}

function FreeOilTrucks()
{
	var Droids = enumDroid(me, DROID_ANY);
	
	for (G in Droids)
	{
		if (Droids[G].droidType == DROID_CONSTRUCT || Droids[G].droidType == DROID_CYBORG_CONSTRUCT)
		{
			groupAddDroid(NonOilTrucks, Droids[G]);
		}
	}
}

function WorkOnBase()
{
	var Researches = enumStruct(me, baseStruct_Research);
	var Generators = enumStruct(me, baseStruct_Generator);
	var Factories = enumStruct(me, baseStruct_Factory);
	var BorgFacs = enumStruct(me, baseStruct_BorgFac);
	var CC = enumStruct(me, baseStruct_CC);	
	
	
	
	//Grab oiler trucks.
	if (NeedToBuildOils())
	{
		if (CountTrucks() >= 6 && CountGroupSize(OilTrucks) < 4)
		{
			GrabOilTrucks();
		}
		BuildOils();
	}
	else
	{
		FreeOilTrucks();
	}
	
	
	//Basic stuff just to get us going
	if (Researches.length < 2)
	{
		OrderBaseBuild(baseStruct_Research);
	}
	else if (Factories.length < 2)
	{
		OrderBaseBuild(baseStruct_Factory);

	}
	
	//More automated base building
	if (Generators.length < 4)
	{
		OrderBaseBuild(baseStruct_Generator);
	}
	else if (Researches.length < Limit_Res)
	{
		OrderBaseBuild(baseStruct_Research);
	}
	else if (Generators.length < Limit_PGen)
	{
		OrderBaseBuild(baseStruct_Generator);
	}
	else if (CC.length < Limit_CC)
	{
		OrderBaseBuild(baseStruct_CC);
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
	OilTrucks = newGroup();
	NonOilTrucks = newGroup();
	
	if (CountTrucks() > 15) HadExtraTrucks = true;
	
	UpdateRatios();
	
	setTimer("DoAllResearch", 1000);
	setTimer("MakeTanks", 700);
	setTimer("MakeBorgs", 700);
	setTimer("WorkOnBase", 700);
	setTimer("WatchForEnemies", 1000);
	setTimer("PerformAttack", 7000);
	setTimer("UpdateRatios", 3000);
	setTimer("FinishHalfBuilds", 7000);
	setTimer("ManageResearchStages", 10000);
}

function UpdateRatios()
{ //Although eventResearched() does a nice job with stuff we researched ourselves, allied stuff needs this function.
	//Make ratios work properly in bases modes.
	for (R in Ratios)
	{
		var Res = getResearch(Ratios[R].Trigger);
		
		if (Res.done)
		{
			var Backup = CurrentRatio;
			CurrentRatio = Ratios[R];
			if (CurrentRatio.TankLimit == Backup.TankLimit)
			{
				CurrentRatio.TankInc = Backup.TankInc;
			}
			if (CurrentRatio.BorgLimit == Backup.BorgLimit)
			{
				CurrentRatio.BorgInc = Backup.BorgInc;
			}
			
			break;
		}
	}
}


function eventDroidBuilt(droid, fac1)
{
	if (droid.droidType == DROID_CONSTRUCT || droid.droidType == DROID_CYBORG_CONSTRUCT)
	{
		--TrucksBeingMade;
	}
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

function eventResearched(Research, Herp)
{
//	debug(me + ":: Research for item " + Research.name + " completed.");
	for (R in Ratios)
	{
		if (Ratios[R].Trigger == Research.name)
		{
//			debug("Event updated ratio to " + Ratios[R].Trigger);
			CurrentRatio = Ratios[R];
		}
	}
}
