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
		    stair_b81_2_1f:{j_mutt:47,workshop:33,stair_b81_2_2f:8},
		    stair_b82_1f:{workshop:2,stair_b82_2f:8},
		    stair_b81_1_1f:{j_mutt:2,stair_b81_1_2f:8},
		    stair_b85_1f:{j_mutt:53,pp:2,stair_b85_2f:8},

		    smo_cafe:{back_alley:27},
		    back_alley:{smo_cafe:27,intersection_of_b81:37,b86:160},
		    intersection_of_b81:{pp:51,back_alley:37,cafeteria:20,b81:49},
		    stair_to_2f:{b81:41,j_mutt:12,Stair_from_1F:8},
		    pp:{intersection_of_b81:51,stair_b85_1f:2,mae_1f:80},
		    j_mutt:{stair_b85:53,stair_to_2f:12,stair_b81_1_1f:2,stair_b81_2_1f:47},
		    stadium:{b89:21,intersection_of_b88:35},
		    dorm:{intersection_of_b88:74},
		    edu_institution:{b81:71},
		    b81:{edu_institution:71,stair_to_2f:41,intersection_of_b81:49},
		    cafeteria:{intersection_of_b81:20},
		    workshop:{stair_b81_2_1f:33,stair_b82_1f:2,ws_road:41,mae_1f:55},
		    mae_1f:{workshop:55,mae_road:35,pp:80},
		    mae_road:{mae_1f:35,ws_road:32,b86:28,b89:30},
		    ws_road:{workshop:41,mae_road:32},
		    b89:{mae_road:30,stadium:21},
		    b86:{mae_road:28,b88:2,back_alley:160},
		    b88:{b86:2,intersection_of_b88:15},
		    intersection_of_b88:{b88:15,stadium:35,dorm:74},

			//2nd floor
			stair_b81_2_2f:{pe:33,std_aff_dpt:32,stair_b81_2_3f:8,stair_b81_2_1f:8},
		    stair_b82_2f:{pe:2,stair_b82_3f:8,stair_b82_1f:8},
		    stair_b81_1_2f:{ece:2,stair_b81_1_3f:8,stair_b81_1_1f:8},
		    stair_b85_2f:{ece:53,teacher_room_2f:2,stair_b85_1f:8,stair_b85_3f:8},

			entrance_2f:{stair_from_1f:29,ece:2},
			stair_from_1f:{entrance_2f:29,stair_to_2f:8},
			ece:{entrance_2f:2,stair_b81_1_2f:2,std_aff_dpt:15,stair_b85_2f:53},
			teacher_room_2f:{stair_b85_2f:2},
			std_aff_dpt:{ece:15,stair_b81_2_2f:32},
			pe:{stair_b81_2_2f:33,stair_b82_2f:2},

			//3rd floor
			stair_b81_2_3f:{linux_room:33,stair_b81_2_2f:8,stair_b81_2_4f:8},
		    stair_b82_3f:{linux_room:2,stair_b82_2F:8,stair_b82_4f:8},
		    stair_b81_1_3f:{meeting_room:2,stair_b81_1_2f:8,stair_b81_1_4f:8},
		    stair_b85_3f:{meeting_room:53,cpre:2,stair_b85_2f:8,stair_b85_4f:8},

			linux_room:{stair_b81_2_3f:33,stair_b82_3f:2,mae_3f:55},
			mae_3f:{linux_room:55},
			meting_room:{stair_b81_1_3f:2,stair_b85_3f:53},
			cpre:{stair_b85_3f:2},

			//4th floor
			stair_b81_2_4f:{robotic_lab:33,some_old_room:2,stair_b81_2_3f:8},
		    stair_bB82_4f:{robotic_lab:2,stair_b82_3f:8},
		    stair_b81_1_4f:{ie:2,stair_B81_1_3f:8},
		    stair_b85_4f:{ie:53,garden:2,stair_b85_3f:8},

			robotic_lab:{stair_b81_2_4f:33,stair_b82_4f:2},
			some_old_room:{ie:47,stair_b81_2_4f:2},
			ie:{stair_b81_1_4f:2, stair_b85_4f:53,some_old_room:47},
			garden:{ stair_b85_4:2,teacher_room_4f:10},
			teacher_room_4f:{garden:10},
		   };
