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
		    stair_b81_2_1f:{in_frnt_of_stair_b81:49,intersection_of_workshop:21,stair_b81_2_2f:4},
		    stair_b82_1f:{workshop:2,stair_b82_2f:4},
		    stair_b81_1_1f:{in_frnt_of_stair_b81:16,stair_b81_1_2f:4,j_mutt:20},
		    stair_b85_1f:{in_frnt_of_stair_b81:28,pp:2,stair_b85_2f:4},

		    smo_cafe:{back_alley:27},
		    back_alley:{smo_cafe:27,intersection_of_b81:41,intersection_of_b88_1:160},
		    intersection_of_b81:{pp:51,back_alley:37,cafeteria:20,b81:21},
		    stair_to_2f:{b81:41,stair_from_1f:4},
		    pp:{intersection_of_b81:51,stair_b85_1f:2,mae_1f:80},
		    in_frnt_of_stair_b81:{stair_b85_1f:28,stair_b81_1_1f:16,stair_b81_2_1f:49,j_mutt:14},
			j_mutt:{b81:36,stair_b81_1_1f:20,in_frnt_of_stair_b81:14},
		    stadium:{b89:26,intersection_of_b88_2:34},
            dorm:{intersection_of_b88_2:74},
            edu_institution:{b81:71},
		    b81:{j_mutt:36,edu_institution:71,stair_to_2f:16,intersection_of_b81:27},
		    cafeteria:{intersection_of_b81:20},
		    workshop:{stair_b82_1f:2,intersection_of_workshop:14,ws_road:41},
			intersection_of_workshop:{stair_b81_2_1f:21,workshop:14,mae_1f:38},
		    mae_1f:{intersection_of_workshop:38,mae_road:35,pp:80},
		    mae_road:{mae_1f:35,ws_road:32,intersection_of_b88_1:20,b89:30},
		    ws_road:{workshop:41,mae_road:32},
		    b89:{mae_road:30,stadium:26,intersection_of_b88_2:39, stair_b89_1f:7},

		    b86:{b88:11, mpte:15,intersection_of_b88_1:28,che:65, stair_b86_1f:7},

			b88:{intersection_of_b88_1:28,mpte:19,b86:11, stair_b88_1f:7},

			mpte:{intersection_of_b88_1:14,b88:19,b86:15},
		    intersection_of_b88_2:{stadium:35,dorm:74,intersection_of_b88_1:35,b89:39},
			intersection_of_b88_1:{intersection_of_b88_2:33,b88:28,b86:28,mae_road:28,back_alley:160,mpte:14},

			//2nd floor
			stair_b81_2_2f:{intersection_of_ece:50,pe:33,stair_b81_2_3f:4,stair_b81_2_1f:4},
		    stair_b82_2f:{pe:2,stair_b82_3f:4,stair_b82_1f:4},
		    stair_b81_1_2f:{intersection_of_ece:16,ece:20,stair_b81_1_3f:4,stair_b81_1_1f:4},
		    stair_b85_2f:{intersection_of_ece:27,teacher_room_2f:11,stair_b85_1f:4,stair_b85_3f:4},

			entrance_2f:{stair_from_1f:10,ece:6},
			stair_from_1f:{entrance_2f:10,stair_to_2f:4},
			ece:{entrance_2f:6,stair_b81_1_2f:20,intersection_of_ece:14},
			intersection_of_ece:{ece:14,stair_b81_2_2f:50,stair_b81_1_2f:16,stair_b85_2f:27},
			teacher_room_2f:{stair_b85_2f:2},
			pe:{stair_b81_2_2f:33,stair_b82_2f:2},

			//3rd floor
			stair_b81_2_3f:{in_frnt_of_stair_b81_1_3f:50,linux_room:33,stair_b81_2_2f:4,stair_b81_2_4f:4},
		    stair_b82_3f:{linux_room:2,stair_b82_2f:4,stair_b82_4f:4},
		    stair_b81_1_3f:{meeting_room:20,in_frnt_of_stair_b81_1_3f:16,stair_b81_1_2f:4,stair_b81_1_4f:4},
		    stair_b85_3f:{in_frnt_of_stair_b81_1_3f:27,cpre:2,stair_b85_2f:4,stair_b85_4f:4},

			linux_room:{stair_b81_2_3f:33,stair_b82_3f:2,mae_3f:39},
			mae_3f:{linux_room:39},
			in_frnt_of_stair_b81_1_3f:{stair_b81_1_3f:16,meeting_room:21,stair_b85_3f:27,stair_b81_2_3f:50},
			meeting_room:{stair_b81_1_3f:20,in_frnt_of_stair_b81_1_3f:21},
			cpre:{stair_b85_3f:11},

			//4th floor
			stair_b81_2_4f:{irobot:33,some_old_room:2,stair_b81_2_3f:4,stair_b81_2_5f:4},
		    stair_b82_4f:{irobot:2,stair_b82_3f:4},
		    stair_b81_1_4f:{ie:2,stair_b81_1_3f:4,stair_b81_1_5f:4},
		    stair_b85_4f:{ie:53,garden:2,stair_b85_3f:4},

			irobot:{stair_b81_2_4f:33,stair_b82_4f:2},
			some_old_room:{ie:47,stair_b81_2_4f:2},
			ie:{stair_b81_1_4f:2, stair_b85_4f:53,some_old_room:47},
			garden:{ stair_b85_4:2,teacher_room_4f:10},
			teacher_room_4f:{garden:10},

			stair_b86_1f:{b86:7, stair_b86_2f:4},
			stair_b86_2f:{stair_b86_3f:4, stair_b86_1f:4},
			stair_b86_3f:{stair_b86_4f:4, stair_b86_2f:4},
			stair_b86_4f:{stair_b86_5f:4, stair_b86_3f:4},
			stair_b86_5f:{stair_b86_6f:4, stair_b86_4f:4},
			stair_b86_6f:{stair_b86_7f:4, stair_b86_5f:4},
			stair_b86_7f:{stair_b86_8f:4, stair_b86_6f:4},
			stair_b86_8f:{stair_b86_9f:4, stair_b86_7f:4},
			stair_b86_9f:{stair_b86_10f:4, stair_b86_8f:4},
			stair_b86_10f:{stair_b86_11f:4, stair_b86_9f:4},
			stair_b86_11f:{stair_b86_12f:4, stair_b86_10f:4},
			stair_b86_12f:{stair_b86_13f:4, stair_b86_11f:4},
			stair_b86_13f:{che:10, stair_b86_12f:4},

            stair_b88_1f:{b88:7,stair_b88_2f:4},
            stair_b88_2f:{stair_b88_3f:4, stair_b88_1f:4},
            stair_b88_3f:{stair_b88_4f:4, stair_b88_2f:4},
            stair_b88_4f:{stair_b88_5f:4, stair_b88_3f:4},
            stair_b88_5f:{le:10, stair_b88_4f:4},

            stair_b89_1f:{b89:7,stair_b89_2f:4},
            stair_b89_2f:{stair_b89_3f:4, ce:10, stair_b89_1f:4},
            stair_b89_3f:{stair_b89_4f:4, stair_b89_2f:4},
            stair_b89_4f:{stair_b89_5f:4, stair_b89_3f:4},
            stair_b89_5f:{stair_b89_6f:4, stair_b89_4f:4},
            stair_b89_6f:{stair_b89_7f:4, stair_b89_5f:4},
            stair_b89_7f:{stair_b89_8f:4, stair_b89_6f:4},
            stair_b89_8f:{iee:10, stair_b89_7f:4},

            iee:{stair_b89_8f:10},
            ce:{stair_b89_2f:10},
            le:{stair_b88_5f:10},
            che:{stair_b86_13f:10},

            stair_b81_1_5f:{stair_b81_2_5f:47,stair_b81_1_6f:4},
            stair_b81_1_6f:{stair_b81_2_6f:47,stair_b81_1_5f:4},
            stair_b81_2_5f:{stair_b81_1_5f:47,stair_b81_2_6f:4},
            stair_b81_2_6f:{stair_b81_1_6f:47,stair_b81_2_5f:4}
		   };