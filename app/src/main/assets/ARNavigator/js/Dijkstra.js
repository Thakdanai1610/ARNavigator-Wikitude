var Graph = (function (undefined) {

	var extractKeys = function (obj) {
		var keys = [], key;
		for (key in obj) {
		    Object.prototype.hasOwnProperty.call(obj,key) && keys.push(key);
		}
		return keys;
	}

	var sorter = function (a, b) {
		return parseFloat (a) - parseFloat (b);
	}

	var findPaths = function (map, start, end, infinity) {
		infinity = infinity || Infinity;

		var costs = {},
		    open = {'0': [start]},
		    predecessors = {},
		    keys;

		var addToOpen = function (cost, vertex) {
			var key = "" + cost;
			if (!open[key]) open[key] = [];
			open[key].push(vertex);
		}

		costs[start] = 0;

		while (open) {
			if(!(keys = extractKeys(open)).length) break;

			keys.sort(sorter);

			var key = keys[0],
			    bucket = open[key],
			    node = bucket.shift(),
			    currentCost = parseFloat(key),
			    adjacentNodes = map[node] || {};

			if (!bucket.length) delete open[key];

			for (var vertex in adjacentNodes) {
			    if (Object.prototype.hasOwnProperty.call(adjacentNodes, vertex)) {
					var cost = adjacentNodes[vertex],
					    totalCost = cost + currentCost,
					    vertexCost = costs[vertex];

					if ((vertexCost === undefined) || (vertexCost > totalCost)) {
						costs[vertex] = totalCost;
						addToOpen(totalCost, vertex);
						predecessors[vertex] = node;
					}
				}
			}
		}

		if (costs[end] === undefined) {
			return null;
		} else {
			return predecessors;
		}

	}

	var extractShortest = function (predecessors, end) {
		var nodes = [],
		    u = end;

		while (u !== undefined) {
			nodes.push(u);
			u = predecessors[u];
		}

		nodes.reverse();
		return nodes;
	}

	var findShortestPath = function (map, nodes) {
		var start = nodes.shift(),
		    end,
		    predecessors,
		    path = [],
		    shortest;

		while (nodes.length) {
			end = nodes.shift();
			predecessors = findPaths(map, start, end);

			if (predecessors) {
				shortest = extractShortest(predecessors, end);
				if (nodes.length) {
					path.push.apply(path, shortest.slice(0, -1));
				} else {
					return path.concat(shortest);
				}
			} else {
				return null;
			}

			start = end;
		}
	}

	var toArray = function (list, offset) {
		try {
			return Array.prototype.slice.call(list, offset);
		} catch (e) {
			var a = [];
			for (var i = offset || 0, l = list.length; i < l; ++i) {
				a.push(list[i]);
			}
			return a;
		}
	}

	var Graph = function (map) {
		this.map = map;
	}

	Graph.prototype.findShortestPath = function (start, end) {
		if (Object.prototype.toString.call(start) === '[object Array]') {
			return findShortestPath(this.map, start);
		} else if (arguments.length === 2) {
			return findShortestPath(this.map, [start, end]);
		} else {
			return findShortestPath(this.map, toArray(arguments));
		}
	}

	Graph.findShortestPath = function (map, start, end) {
		if (Object.prototype.toString.call(start) === '[object Array]') {
			return findShortestPath(map, start);
		} else if (arguments.length === 3) {
			return findShortestPath(map, [start, end]);
		} else {
			return findShortestPath(map, toArray(arguments, 1));
		}
	}

	return Graph;

})();

var map = {
    // 1st floor
    Stair_B81_2_1F: { J_Mutt: 47, Workshop: 33, Stair_B81_2_2F: 8 },
    Back_Stair_Elev_1F: { Workshop: 2, Back_Stair_Elev_2F: 8 },
    Front_Stair_Elev_1F: { J_Mutt: 2, Front_Stair_Elev_2F: 8 },
    PP_Stair_1F: { J_Mutt: 53, PP: 2, PP_Stair_2F: 8 },

    Smo_Cafe: { Back_Alley: 27 },
    Back_Alley: { Smo_Cafe: 27, Intersection_of_B81: 37, B86: 160 },
    Intersection_of_B81: { PP: 51, Back_Alley: 37, Cafeteria: 20, In_front_of_B81: 49 },
    Stair_to_2F: { In_front_of_B81: 41, J_Mutt: 12, Stair_from_1F: 8 },
    PP: { Intersection_of_B81: 51, PP_Stair_1F: 2, MAE_1F: 80 },
    J_Mutt: { PP_Stair_1F: 53, Stair_to_2F: 12, Front_Stair_Elev_1F: 2, Stair_B81_2_1F: 47 },
    Parking_Lot: { B89: 21, Intersection_of_B88: 35 },
    Dorm: { Intersection_of_B88: 74 },
    Edu_Institution: { In_front_of_B81: 71 },
    In_front_of_B81: { Edu_Institution: 71, Stair_to_2F: 41, Intersection_of_B81: 49 },
    Cafeteria: { Intersection_of_B81: 20 },
    Workshop: { Stair_B81_2_1F: 33, Back_Stair_Elev_1F: 2, WS_Road: 41, MAE_1F: 55 },
    MAE_1F: { Workshop: 55, MAE_Road: 35, PP: 80 },
    MAE_Road: { MAE_1F: 35, WS_Road: 32, B86: 28, B89: 30 },
    WS_Road: { Workshop: 41, MAE_Road: 32 },
    B89: { MAE_Road: 30, Parking_Lot: 21 },
    B86: { MAE_Road: 28, B88: 2, Back_Alley: 160 },
    B88: { B86: 2, Intersection_of_B88: 15 },
    Intersection_of_B88: { B88: 15, Parking_Lot: 35, Dorm: 74 },

    //2nd floor
    Stair_B81_2_2F: { PE: 33, Student_Affairs_Dept: 32, Stair_B81_2_3F: 8, Stair_B81_2_1F: 8 },
    Back_Stair_Elev_2F: { PE: 2, Back_Stair_Elev_3F: 8, Back_Stair_Elev_1F: 8 },
    Front_Stair_Elev_2F: { ECE: 2, Front_Stair_Elev_3F: 8, Front_Stair_Elev_1F: 8 },
    PP_Stair_2F: { ECE: 53, Teacher_room_2F: 2, PP_Stair_3F: 8, PP_Stair_1F: 8 },

    Entrance_2F: { Stair_from_1F: 29, ECE: 2 },
    Stair_from_1F: { Entrance_2F: 29, Stair_to_2F: 8 },
    ECE: { Entrance_2F: 2, Front_Stair_Elev_2F: 2, Student_Affairs_Dept: 15, PP_Stair_2F: 53 },
    Teacher_room_2F: { PP_Stair_2F: 2 },
    Student_Affairs_Dept: { ECE: 15, Stair_B81_2_2F: 32 },
    PE: { Stair_B81_2_2F: 33, Back_Stair_Elev_2F: 2 },

    //3rd floor
    Stair_B81_2_3F: { Linux_Room: 33, Stair_B81_2_2F: 8, Stair_B81_2_4F: 8 },
    Back_Stair_Elev_3F: { Linux_Room: 2, Back_Stair_Elev_2F: 8, Back_Stair_Elev_4F: 8 },
    Front_Stair_Elev_3F: { Meeting_Room: 2, Front_Stair_Elev_2F: 8, Front_Stair_Elev_4F: 8 },
    PP_Stair_3F: { Meeting_Room: 53, CprE: 2, PP_Stair_2F: 8, PP_Stair_4F: 8 },

    Linux_Room: { Stair_B81_2_3F: 33, Back_Stair_Elev_3F: 2, MAE_3F: 55 },
    MAE_3F: { Linux_Room: 55 },
    Meeting_Room: { Front_Stair_Elev_3F: 2, PP_Stair_3F: 53 },
    CprE: { PP_Stair_3F: 2 },

    //4th floor
    Stair_B81_2_4F: { Robotic_Lab: 33, Some_Old_Room: 2, Stair_B81_2_3F: 8 },
    Back_Stair_Elev_4F: { Robotic_Lab: 2, Back_Stair_Elev_3F: 8 },
    Front_Stair_Elev_4F: { IE: 2, Front_Stair_Elev_3F: 8 },
    PP_Stair_4F: { IE: 53, Garden: 2, PP_Stair_3F: 8 },

    Robotic_Lab: { Stair_B81_2_4F: 33, Back_Stair_Elev_4F: 2 },
    Some_Old_Room: { IE: 47, Stair_B81_2_4F: 2 },
    IE: { Front_Stair_Elev_4F: 2, PP_Stair_4F: 53, Some_Old_Room: 47 },
    Garden: { PP_Stair_4F: 2, Teacher_room_4F: 10 },
    Teacher_room_4F: { Garden: 10 },
};
