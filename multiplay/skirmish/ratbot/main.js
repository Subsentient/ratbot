/* RatBot, by Subsentient.
 * Public domain.
 */


///How many tiles away an oil has to be before we will NOT build it.
const MaxOilDistance = 20;
const MaxWatchingDistance = 45;

var TrucksBeingMade = 0; //The number of trucks currently in production.
var HadExtraTrucks = false; //If we started with more than 15 trucks, as some maps do.
var EnemyNearBase = false; //Whether there's enemy units near our base.
var UniversalRallyPoint = null;
var FactoryMode = null;
var LastBeaconX = null;
var LastBeaconY = null;
var LastBeaconOrigin = null;
var FastControlPlayer = null;

/**//*AFTER THIS IS STUFF THAT CAN CHANGE.*//**/

var CurrentRatio = new UnitRatio(null, 0.0, 0.0); //Trigger weapon doesn't matter for the first ratio.

var BuildJobs = [];

var IsATWeapon = {};
var RBGCounter = 0; //Group 1 is reserved for things that don't belong in a group.
var RBGReg = {};

function RBGroup()
{
	this.ID = ++RBGCounter;
}

RBGroup.prototype = 
{
	AddDroid : function(Droid)
	{
		RBGReg[Droid.id] = this.ID;
	},
	
	DelDroid : function(Droid)
	{
		delete RBGReg[Droid.id];
	},
	
	HasDroid : function(Droid)
	{
		return RBGReg[Droid.id] === this.ID;
	},
	
	Wipe : function()
	{
		for (R in RBGReg)
		{
			if (RBGReg[R] === this.ID)
			{
				delete RBGReg[R];
			}
		}
	},
	
	Assign : function(Truckles)
	{
		this.Wipe();
		
		for (T in Truckles)
		{
			this.AddDroid(Truckles[T]);
		}
	},
	
	GetDroids : function()
	{ //Only returns living droids, obviously.
		var Droids = enumDroid(me, DROID_ANY);
		
		var RetVal = [];
		
		for (D in Droids)
		{
			if (this.HasDroid(Droids[D]))
			{
				RetVal.push(Droids[D]);
			}
		}
	
		return RetVal;
	},
	
	Size : function()
	{ //Kinda expensive.
		var Num = 0;

		for (R in RBGReg)
		{
			if (RBGReg[R] === this.ID) ++Num;
		}
		
		return Num;
	},
}

var OilTrucks = new RBGroup();

function BuildJob(Truckles, StructType, x, y, TrucksWeWant, ModNum)
{
	this.Group = new RBGroup();
	this.StructType = StructType;
	this.x = x;
	this.y = y;
	this.TrucksWeWant = TrucksWeWant;
	this.Completed = false;
	
	this.StartingNumModules = ModNum; //How many modules we had when this job was created.
	
	for (T in Truckles)
	{
		if (!Truckles[T]) continue;
		
		this.Group.AddDroid(Truckles[T]);

		orderDroidBuild(Truckles[T], DORDER_BUILD, this.StructType, this.x, this.y);
	}
	
	rbdebug("Started build job for a " + this.StructType + " at " + this.x + "," + this.y + " using " + Truckles.length + " trucks");
}

function StructUsesModules(StructType)
{
	switch (StructType)
	{
		case baseStruct_Generator:
		case baseStruct_Factory:
		case baseStruct_Research:
			return true;
		default:
			return false;
	}
}

BuildJob.prototype =
{
	NumAssignedTrucks : function()
	{ //Only returns living trucks.
		return this.Group.Size();
	},
}

function GetJobForStruct(x, y, StructType)
{
	var J = BuildJobs;
	
	for (B in J)
	{
		if (J[B].x == x && J[B].y == y && (!StructType || J[B].StructType === StructType) ) return J[B];
	}
	
	return null;
}

function AttackUnitBusy(Droid)
{
	switch (Droid.order)
	{
		case DORDER_ATTACK:
		case DORDER_RECYCLE:
		case DORDER_RTR:
			return true;
		default:
			return false;
	}
}
			
function GetCurrentBorgATPercent()
{
	var Droids = enumDroid(me, DROID_ANY);
	
	var NumAT = 0;
	var NumDroids = 0;
	
	for (D in Droids)
	{
		if (Droids[D].droidType !== DROID_CYBORG) continue;
		
		if (IsAntiTank(Droids[D])) ++NumAT;
		
		++NumDroids;
	}
	
	var Value = (NumAT / NumDroids) * 100;
	
	return Value >= 1 ? Value : 0;
}

function GetCurrentTankATPercent()
{
	var Droids = enumDroid(me, DROID_ANY);
	
	var NumAT = 0;
	var NumDroids = 0;
	
	for (D in Droids)
	{
		if (Droids[D].droidType !== DROID_WEAPON) continue;
		
		if (IsAntiTank(Droids[D])) ++NumAT;
		
		++NumDroids;
	}
	
	var Value = (NumAT / NumDroids) * 100;
	
	return Value >= 1 ? Value : 0;
}

function ShouldBuildATTank()
{
	return CurrentRatio.TankATPercent >= GetCurrentTankATPercent();
}

function ShouldBuildATBorg()
{ //le operator is not a typo.
	return CurrentRatio.BorgATPercent >= GetCurrentBorgATPercent();
}

function PopulateWeaponTypes()
{
	for (Tmp in AT_TankTemplates)
	{
		IsATWeapon[AT_TankTemplates[Tmp][2]] = true;
	}
	for (Tmp in AT_BorgTemplates)
	{
		IsATWeapon[AT_BorgTemplates[Tmp][2]] = true;
	}
	for (Tmp in AP_TankTemplates)
	{
		IsATWeapon[AP_TankTemplates[Tmp][2]] = false;
	}
	for (Tmp in AP_BorgTemplates)
	{
		IsATWeapon[AP_BorgTemplates[Tmp][2]] = false;
	}
}

function IsAntiBorg(Droid)
{
	return !IsATWeapon[Droid.weapons[0].name];
}

function IsAntiTank(Droid)
{
	return IsATWeapon[Droid.weapons[0].name];
}

function eventDestroyed(Obj)
{
	if (Obj.type === DROID)
	{
		delete RBGReg[Obj.id];
	}
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

function ChooseForwardLocation(Enemy, DistancePercent)
{
	var Us = startPositions[me];
	var Them = startPositions[Enemy];
	
	var NewPos = { y: Us.x, y : Us.y }
	
	if (Us.x > Them.x)
	{
		NewPos.x = Us.x - ((Us.x - Them.x) * (DistancePercent / 100));
	}
	else
	{
		NewPos.x = Us.x + ((Them.x - Us.x) * (DistancePercent / 100));
	}
	
	if (Us.y > Them.y)
	{
		NewPos.y = Us.y - ((Us.y - Them.y) * (DistancePercent / 100));
	}
	else
	{
		NewPos.y = Us.y + ((Them.y - Us.y) * (DistancePercent / 100));
	}
	
	NewPos.x = Math.floor(NewPos.x);
	NewPos.y = Math.floor(NewPos.y);
	
	return NewPos;
}
	

function AttackTarget(TargetObject, UnitList, ForceAttack)
{
	for (D in UnitList)
	{
		if (IsTruck(UnitList[D])) continue;
		
		if (!droidCanReach(UnitList[D], TargetObject.x, TargetObject.y)) continue;
		
		if (UnitList[D].order === DORDER_ATTACK && !ForceAttack) continue;
		//In range for an attack.

		//Fire on the appropriate type of unit wherever possible.
		if (!ForceAttack &&
			TargetObject.type == DROID &&
			(TargetObject.droidType != DROID_CYBORG &&
			IsAntiBorg(UnitList[D])) ||
			(TargetObject.droidType == DROID_CYBORG &&
			IsAntiTank(UnitList[D])))
		{
			orderDroidLoc(UnitList[D], DORDER_MOVE, TargetObject.x, TargetObject.y);
			continue;
		}
		
		if (orderDroidObj(UnitList[D], DORDER_ATTACK, TargetObject)) continue;
		
		orderDroidLoc(UnitList[D], DORDER_MOVE, TargetObject.x, TargetObject.y);
	}
}

function WatchForEnemies()
{
	if (FastControlPlayer !== null) return;
	
	var EnemyDroids = enumRange(startPositions[me].x, startPositions[me].y, MaxWatchingDistance, ENEMIES, true);		
	
	if ((EnemyNearBase = (EnemyDroids && EnemyDroids.length > 0)))
	{
		rbdebug("Attacking " + EnemyDroids.length + " nearby enemy droids");
		
		var Droids = enumDroid(me, DROID_ANY);
	
		if (!Droids || !Droids.length) return;
		
		for (D in EnemyDroids)
		{
			AttackTarget(EnemyDroids[D], Droids, false);
		}
	}
}

function ChooseEnemy(Force)
{
	if (EnemyNearBase && !Force) return null; //Don't go on a crusade when there's a bad guy nearby.
	
	var Enemies = [];
	
	//Enumerate all enemies we have.
	for (var Inc = 0; Inc < maxPlayers; ++Inc)
	{
		//Never attack while someone is superior, sit and build up our forces instead.
		if (!Force && WeAreWeaker(Inc)) return null;
		
		if (Inc === me || allianceExistsBetween(me, Inc)) continue;
		
		var EnemyStructs = enumCriticalStructs(Inc);
		var EnemyDroids = enumDroid(Inc, DROID_ANY);
		
		var OurDroids = enumDroid(me, DROID_ANY);
		
		if ((EnemyDroids.length || EnemyStructs.length) && OurDroids && OurDroids.length > 0 &&
			droidCanReach(OurDroids[0], startPositions[Inc].x, startPositions[Inc].y))
		{
			Enemies.push(Inc);
		}
	}
	
	if (!Enemies.length) return null;
	
	
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
	if (FastControlPlayer !== null) return;
	
	var Droids = enumDroid(me, DROID_ANY);
	
	//Find an enemy to pwn
	var Target = ChooseEnemy(false);
	
	if (Target == null)
	{
		OrderRetreat(false);
		return;
	}
	
	var EnemyDroids = enumDroid(Target, DROID_ANY);
	var EnemyAttackDroids = 0;
	var OurAttackDroids = 0;
	
	for (D in Droids)
	{ //Our attack droids.
		if (Droids[D].droidType === DROID_CYBORG_CONSTRUCT || Droids[D].droidType === DROID_CONSTRUCT) continue;
		++OurAttackDroids;
	}
	
	for (D in EnemyDroids)
	{ //Enemy attack droids.
		if (EnemyDroids[D].droidType === DROID_CYBORG_CONSTRUCT || EnemyDroids[D].droidType === DROID_CONSTRUCT) continue;
		++EnemyAttackDroids;
	}
	
	//Only attack when we got all possible units, or we have 3x as many units as them.
	if (Droids.length != 150 && ((EnemyAttackDroids * 3 > OurAttackDroids) || OurAttackDroids < 20))
	{
		OrderRetreat(false);
		return;
	}
	
	var NonDefenseStructs = enumCriticalStructs(Target);

	if (EnemyAttackDroids < 20)
	{ ///They are almost dead, finish them off.
		for (Droid in Droids)
		{
			var AttackStructure = Math.floor(Math.random()*2); //Boolean
			
			if (Droids[Droid].droidType === DROID_CONSTRUCT || Droids[Droid].droidType === DROID_CYBORG_CONSTRUCT) continue;
			
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
			if (Droids[Droid].droidType === DROID_CONSTRUCT || Droids[Droid].droidType === DROID_CYBORG_CONSTRUCT)
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
		
		
		if (ShouldBuildATBorg())
		{
			for (T in AT_BorgTemplates)
			{
				var TemplateName = AT_BorgTemplates[T][2] + " " + AT_BorgTemplates[T][0] + " " + AT_BorgTemplates[T][1];
				if (buildDroid(BorgFacs[Fac], TemplateName, AT_BorgTemplates[T][0], AT_BorgTemplates[T][1], "", DROID_CYBORG, AT_BorgTemplates[T][2]))
				{
					continue FactoryLoop;
				}
			}
		}
		
		for (T in AP_BorgTemplates)
		{
			var TemplateName = AP_BorgTemplates[T][2] + " " + AP_BorgTemplates[T][0] + " " + AP_BorgTemplates[T][1];
			
			if (buildDroid(BorgFacs[Fac], TemplateName, AP_BorgTemplates[T][0], AP_BorgTemplates[T][1], "", DROID_CYBORG, AP_BorgTemplates[T][2]))
			{
				continue FactoryLoop;
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
		var Job = GetJobForStruct(Structs[S].x, Structs[S].y);
		
		if (Structs[S].status != BUILT && (!Job || Job.Completed || !Job.NumAssignedTrucks() || AllTrucksIdle(Job.Group)))
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

function FindTrucks(Requested, StealOk, AllowOilers)
{ //Find Requested number of idle trucks.
	var TruckList = [];
	
	var KnownTrucks = enumDroid(me, DROID_CONSTRUCT);
	var KnownBorgTrucks = enumDroid(me, DROID_CYBORG_CONSTRUCT);
	var Known = KnownTrucks.concat(KnownBorgTrucks);
	
	for (var Inc = 0; Inc < Known.length; ++Inc)
	{
		if (!AllowOilers && IsOilTruck(Known[Inc]))
		{
			continue;
		}
		
		if (TruckBusy(Known[Inc]))
		{
			if (!StealOk) continue;
		}
		
		TruckList.push(Known[Inc]);
		
		if (Requested !== undefined && TruckList.length === Requested) break;
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
			return null;
	}
	
	var Job = GetJobForStruct(BaseStructure.x, BaseStructure.y, Module);
	
	if (Job) return null;
	
	var Truckles = FindTrucks(TrucksWeWant, false);
	
	if (Truckles == null || Truckles.length < 2) return null;
	
	var Job = new BuildJob(Truckles, Module, BaseStructure.x, BaseStructure.y, TrucksWeWant, BaseStructure.modules);

	BuildJobs.push(Job);
	
	return Job;
	
}

function NeedToBuildOils()
{
	if (CountTrucks() < 5) return false;
	
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

function IsOilTruck(Droid)
{
	return OilTrucks.HasDroid(Droid);
}

function FindNextIdleOilTruck()
{
	var Truckles = OilTrucks.GetDroids();
	
	for (T in Truckles)
	{
		if (TruckBusy(Truckles[T])) continue;
		
		return Truckles[T];
	}
	
	return null;
}

function GrabNewOilTrucks(NumTrucks)
{
	var Truckles = FindTrucks(NumTrucks, false, true);
	
	if (!Truckles || !Truckles.length) return null;
	
	return Truckles;
}

function BuildOils()
{
	var NumTrucks = CountTrucks();
	
	var MinimumTotalTrucks = 6;
	
	if (NumTrucks < MinimumTotalTrucks) return false;
	
	var Truckles = OilTrucks.GetDroids();
	var OSize = Truckles.length;

	var OilTrucksWanted = 4;

	//No pre-existing oiler trucks.
	if (OSize < OilTrucksWanted)
	{
		var NewTruckles = GrabNewOilTrucks(OilTrucksWanted);
		
		if (NewTruckles && NewTruckles.length > OSize)
		{
			OilTrucks.Assign(NewTruckles);
			Truckles = NewTruckles;
			
			rbdebug("Grabbed " + Truckles.length + " oiler trucks");
		}
	}
	
	if (!Truckles || !Truckles.length) return false;

	var Oils = enumFeature(-1, OilPool);
	
	for (var Inc = 0; Inc < Oils.length; ++Inc)
	{
		if (MaxOilDistance < distBetweenTwoPoints(startPositions[me].x, startPositions[me].y, Oils[Inc].x, Oils[Inc].y))
		{ //Too far away
			continue;
		}
		
		if (GetJobForStruct(Oils[Inc].x, Oils[Inc].y, baseStruct_Derrick)) continue;
		
		var Trucky = FindNextIdleOilTruck();
		
		if (!Trucky) return false;
		
		var Job = new BuildJob([Trucky], baseStruct_Derrick, Oils[Inc].x, Oils[Inc].y, 1, 0);
		
		rbdebug("Ordering oil derrick at " + Oils[Inc].x + "," + Oils[Inc].y + ", with truck id " + Trucky.id);
		
		BuildJobs.push(Job);
		
		return true;
	}
	
	return false;
}

function OrderBaseBuild(StructureType)
{
	var TrucksWeWant = 4;
	var Truckles = FindTrucks(TrucksWeWant, false, false);
	
	if (!Truckles || Truckles.length < 2) return null;
	
	var Location = pickStructLocation(Truckles[0], StructureType, Truckles[0].x, Truckles[0].y, 0);
	
	if (!Location) return null;
	
	if (GetJobForStruct(Location.x, Location.y)) return null;
		
	var Job = new BuildJob(Truckles, StructureType, Location.x, Location.y, TrucksWeWant, 0);
	
	BuildJobs.push(Job);
	
	return Job;
}

function eventStructureBuilt(Struct, Droid)
{
	rbdebug("Entered eventStructureBuilt for structure at " + Struct.x + "," + Struct.y);

	for (var Inc = 0; Inc < BuildJobs.length; ++Inc)
	{
		if (BuildJobs[Inc].x == Struct.x && BuildJobs[Inc].y == Struct.y)
		{
			rbdebug("Structure " + BuildJobs[Inc].StructType + " completed at " + Struct.x + "," + Struct.y);
			//We just delete these ones.
			BuildJobs.splice(Inc);
			break;
		}
	}
}

function MakeTrucks(IsBorgFac)
{
	var Trucks = enumDroid(me, DROID_CONSTRUCT);
	var TruckNum = CountTrucks() + TrucksBeingMade;
	
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
		if (!structureIdle(Facs[Inc]) || Facs[Inc].status !== BUILT) continue;
		
		if (IsBorgFac)
		{
			if (buildDroid(Facs[Inc], "Combat Engineer", "CyborgLightBody", "CyborgLegs", "", DROID_CYBORG_CONSTRUCT, "CyborgSpade"))
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
		if (Group[G].id === Droid.id)
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
		
		//AT tanks
		if (ShouldBuildATTank())
		{
			for (T in AT_TankTemplates)
			{
				var TemplateName = AT_TankTemplates[T][2] + " " + AT_TankTemplates[T][0] + " " + AT_TankTemplates[T][1];
				if (buildDroid(Facs[Fac], TemplateName, AT_TankTemplates[T][0], AT_TankTemplates[T][1], "", DROID_WEAPON, AT_TankTemplates[T][2]))
				{
					continue FactoryLoop;
				}
			}
		}
		
		//AP tanks
		for (T in AP_TankTemplates)
		{
			var TemplateName = AP_TankTemplates[T][2] + " " + AP_TankTemplates[T][0] + " " + AP_TankTemplates[T][1];
			if (buildDroid(Facs[Fac], TemplateName, AP_TankTemplates[T][0], AP_TankTemplates[T][1], "", DROID_WEAPON, AP_TankTemplates[T][2]))
			{	
				continue FactoryLoop;
			}
		}
		
	}
}

function eventGameInit()
{
	PopulateWeaponTypes();
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
		if (Researches[Inc].status === BEING_BUILT) continue;

		ResearchSomething(Researches[Inc]);
	}
}

function NumRepairFacilities()
{
	var Repairs = enumStruct(me, REPAIR_FACILITY);
	
	return Repairs ? Repairs.length : 0;
}
	
function WorkOnBase()
{
	var Researches = enumStruct(me, baseStruct_Research);
	var Generators = enumStruct(me, baseStruct_Generator);
	var Factories = enumStruct(me, baseStruct_Factory);
	var BorgFacs = enumStruct(me, baseStruct_BorgFac);
	var CC = enumStruct(me, baseStruct_CC);	
	
	
	var NumTrucks = CountTrucks();
	
	//Grab oiler trucks.
	if (NeedToBuildOils())
	{
		BuildOils();
	}
	else
	{
		OilTrucks.Wipe();
	}
	
	//Basic stuff just to get us going
	if (NumTrucks <= 4 && Factories.length < 2)
	{
		OrderBaseBuild(baseStruct_Factory);
		return; //Don't try and build anything else but oils until we have these.
	}
	
	if (Researches.length < 3)
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
		var FoundOne = false;
		
		//Researches
		for (var Inc = 0; Inc < Researches.length; ++Inc)
		{
			if (!Researches[Inc].modules)
			{
				if (OrderModuleBuild(Researches[Inc]))
				{
					FoundOne = true;
				}
			}
		}
		
		if (FoundOne) return; //Research modules first.
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
	
	if (isStructureAvailable(baseStruct_Repair, me) && NumRepairFacilities() < 5)
	{
		var RP = GetUniversalRallyPoint();
		
		if (!RP) return;
		
		var TrucksWeWant = 1;
		
		var Truckles = FindTrucks(TrucksWeWant, false);
		
		if (!Truckles) return;
		
		var Location = pickStructLocation(Truckles[0], baseStruct_Repair, RP.x, RP.y);
	
		if (!Location) return;
	
		if (GetJobForStruct(Location.x, Location.y, baseStruct_Repair)) return;
		
		var Job = new BuildJob(Truckles, baseStruct_Repair, Location.x, Location.y, TrucksWeWant, 0);
		
		BuildJobs.push(Job);
	}
}

function CheckNeedRecycle()
{
	var Droids = enumDroid(me, DROID_ANY);
	var RecycleCount = 35;
	
	if (Droids.length !== 150) return; //Nothing to do.
	
	rbdebug("At unit limit. Recycling " + RecycleCount + " attack units.");
	
	for (var Dec = Droids.length - 1; Dec >= Droids.length - (RecycleCount + 1); --Dec)
	{
		if (!IsAttackUnit(Droids[Dec])) continue;
		
		orderDroid(Droids[Dec], DORDER_RECYCLE);
	}
}

function IsTruck(Droid)
{
	switch (Droid.droidType)
	{
		case DROID_CYBORG_CONSTRUCT:
		case DROID_CONSTRUCT:
			return true;
		default:
			return false;
	}
}

function IsAttackUnit(Droid)
{
	switch (Droid.droidType)
	{
		case DROID_WEAPON:
		case DROID_CYBORG:
			return true;
		default:
			return false;
	}
}

function RetreatTrucks()
{
	var Droids = enumDroid(me, DROID_CONSTRUCT);
	
	for (D in Droids)
	{
		if (TruckBusy(Droids[D]) || IsOilTruck(Droids[D])) continue;
		
		orderDroidLoc(Droids[D], DORDER_MOVE, startPositions[me].x, startPositions[me].y);
	}
}

function AllTrucksIdle(Group)
{
	var Truckles = Group.GetDroids();
	
	for (T in Truckles)
	{
		if (TruckBusy(Truckles[T])) return false;
	}
	
	return true;
}

function CheckForDeadBuildJobs()
{
	Reset:
	for (var Inc = 0; Inc < BuildJobs.length; ++Inc)
	{
		if (BuildJobs[Inc].Completed || !BuildJobs[Inc].NumAssignedTrucks() || AllTrucksIdle(BuildJobs[Inc].Group))
		{
			BuildJobs[Inc].Group.Wipe();
			BuildJobs.splice(Inc);
			continue Reset;
		}
	}
}

function eventStartLevel()
{
	if (CountTrucks() > 15) HadExtraTrucks = true;
	
	UpdateRatios();
	
	setTimer("DoAllResearch", 500);
	setTimer("CheckForDeadBuildJobs", 300);
	setTimer("MakeTanks", 300);
	setTimer("MakeBorgs", 300);
	setTimer("WorkOnBase", 300);
	setTimer("WatchForEnemies", 1000);
	setTimer("PerformAttack", 7000);
	setTimer("UpdateRatios", 3000);
	setTimer("CheckNeedRecycle", 20000);
	setTimer("RetreatTrucks", 5000);
	setTimer("FinishHalfBuilds", 5000);
	setTimer("ManageResearchStages", 5000);
	setTimer("UpdateUniversalRallyPoint", 30000);
}

function UpdateRatios()
{ //Although eventResearched() does a nice job with stuff we researched ourselves, allied stuff needs this function.
	//Make ratios work properly in bases modes.
	for (R in Ratios)
	{
		var Res = getResearch(Ratios[R].TriggerTech);
		
		if (Res.done)
		{
			CurrentRatio = Ratios[R];	
			break;
		}
	}
}

function UpdateUniversalRallyPoint()
{
	var Enemy = ChooseEnemy(true);
	
	if (!Enemy) return null;
	
	//Move to a reasonable rally point. The actual API for this seems to be broken.
	UniversalRallyPoint = ChooseForwardLocation(Enemy, 25);
}

function GetUniversalRallyPoint()
{
	if (!UniversalRallyPoint)
	{
		UpdateUniversalRallyPoint();
	}
	
	return UniversalRallyPoint;
}

function eventDroidBuilt(droid, fac1)
{
	if (droid.droidType === DROID_CONSTRUCT || droid.droidType === DROID_CYBORG_CONSTRUCT)
	{
		--TrucksBeingMade;
		return;
	}
	
	if (FactoryMode !== null)
	{
		donateObject(droid, FactoryMode);
		return;
	}
	
	var Loc = GetUniversalRallyPoint();
	
	if (!Loc) return;
	
	orderDroidLoc(droid, DORDER_MOVE, Loc.x, Loc.y);
}

function WeAreWeaker(OtherPlayer)
{
	var OurDroids = enumDroid(me, DROID_ANY);
	var TheirDroids = enumDroid(OtherPlayer, DROID_ANY);
	
	if (OurDroids.length >= TheirDroids.length) return false;

	return (OurDroids.length / TheirDroids.length * 100) < 85; //85% size of enemy force
}

function OrderRetreat(Force)
{
	var Droids = enumDroid(me, DROID_ANY);

	rbdebug("Retreating");
	
	for (D in Droids)
	{
		if (Droids[D].droidType == DROID_CONSTRUCT || Droids[D].droidType == DROID_CYBORG_CONSTRUCT) continue;

		if (!Force && AttackUnitBusy(Droids[D])) continue;
		
		var Loc = GetUniversalRallyPoint();
		
		if (!Loc) continue;
		
		orderDroidLoc(Droids[D], DORDER_MOVE, Loc.x, Loc.y);
	}
}
function eventChat(Origin, Target, Msg)
{
	if (Target !== me || !allianceExistsBetween(Origin, me))
	{
		return;
	}
	
	switch (Msg)
	{
		case "fastcontrol":
		case "fc":
			FastControlPlayer = FastControlPlayer !== null ? null : Origin;
			
			chat(Origin, FastControlPlayer !== null ?
						"I will move my attack units to wherever you drop beacons in the future." :
						"I will stop following your beacons.");
			
			break;
		case "factorymode":
		case "fm":
			FactoryMode = FactoryMode !== null ? null : Origin;

			
			chat(Origin, FactoryMode !== null ?
						"I will gift future units to you as they produce." :
						"I will stop automatically gifting you units.");

			//Fall through
		case "givetanks":
		{
			var Droids = enumDroid(me, DROID_ANY);
			
			if (!Droids)
			{
				break;
			}
			
			for (Droid in Droids)
			{
				if (Droids[Droid].droidType === DROID_CONSTRUCT || Droids[Droid].droidType === DROID_CYBORG_CONSTRUCT)
				{
					continue;
				}
				
				donateObject(Droids[Droid], Origin);
			}
			break;
		}
		case "truck":
		{
			var Trucks = enumDroid(me, DROID_CONSTRUCT);
			
			if (Trucks)
			{
				Trucks.concat(enumDroid(me, DROID_CYBORG_CONSTRUCT));
			}
			
			if (!Trucks || !Trucks.length)
			{
				break;
			}
			
			donateObject(Trucks[0], Origin);
			break;
		}
		//Easter eggs for you.
		case "We are the Borg.":
		case "You will be assimilated.":
		case "Resistance is futile.":
		case "Resistance is Futile.":
		case "We will adapt.":
		case "Irrelevant.":
		case "We are Borg.":
		case "We are Borg":
		case "Irrelevant. You will be assimilated.":
		{
			if (playerData[Origin].isAI)
			{
				break;
			}
			
			chat(ALL_PLAYERS, Msg);
			break;
		}
		case "power":
			donatePower(playerPower(me) / 2, Origin);
			break;
		case "go here":
		{
			if (LastBeaconOrigin !== Origin || LastBeaconX === null || LastBeaconY === null)
			{
				break;
			}
			
			var Droids = enumDroid(me, DROID_ANY);
			
			for (Droid in Droids)
			{
				if (Droids[Droid].droidType === DROID_CONSTRUCT || Droids[Droid].droidType === DROID_CYBORG_CONSTRUCT)
				{
					continue;
				}
				
				orderDroidLoc(Droids[Droid], DORDER_MOVE, LastBeaconX, LastBeaconY);
			}
			
			break;
		}
	}
}

function eventAttacked(Target, Attacker)
{
	//Account for splash damage
	if (Attacker.player === me || EnemyNearBase || FastControlPlayer !== null) return;

	if (Target.type === DROID && Target.health < 60 && NumRepairFacilities() > 0) //60% damage
	{
		orderDroid(Target, DORDER_RTR);
	}
	
	if (WeAreWeaker(Attacker.player))
	{
		OrderRetreat(true);
		return;
	}
	
	var Droids = enumDroid(me, DROID_ANY);
	
	if (!Droids || !Droids.length) return;
	
	AttackTarget(Attacker, Droids, false);
}

function rbdebug(Msg)
{
	debug("RatBot " + me + ":: " + Msg);
}


function eventBeacon(X, Y, Origin, Target, Msg)
{
	if (Target !== me || !allianceExistsBetween(Origin, me))
	{
		return;
	}
	
	if (Origin == FastControlPlayer)
	{ //Perform fast movement control
		
		var Droids = enumDroid(me, DROID_ANY);
		
		for (D in Droids)
		{
			if (IsTruck(Droids[D])) continue;
			
			var Obj = getObject(X, Y);
			
			if (Obj)
			{
				orderDroidObj(Droids[D], DORDER_ATTACK, Obj);
			}
			else
			{
				orderDroidLoc(Droids[D], DORDER_MOVE, X, Y);
			}
		}
	}
	
	LastBeaconX = X;
	LastBeaconY = Y;
	LastBeaconOrigin = Origin;
}

function eventResearched(Research, Herp)
{
	rbdebug("Research for item " + Research.name + " completed.");
	
	for (R in Ratios)
	{
		if (Ratios[R].Trigger == Research.name)
		{
			rbdebug("Event updated ratio to " + Ratios[R].Trigger);
			CurrentRatio = Ratios[R];
		}
	}
}
