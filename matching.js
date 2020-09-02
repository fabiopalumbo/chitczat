/*
  Edmonds's maximum matching algorithm
  Complexity: O(v^3)
  Written by Felipe Lopes de Freitas
  Adapted to JavaScript from C++ (http://pastebin.com/NQwxv32y) by גלעד ברקן
*/

var MAX = 100,
  undef = -2,
  empty = -1,
  noEdge = 0,
  unmatched = 1,
  matched = 2,
  forward = 0,
  reverse = 0,
  graph = [];

//Labels are the key to this implementation of the algorithm.
function Label() {
  //An even label in a vertex means there's an alternating path
  this.even = undefined; //of even length starting from the root node that ends on the
  this.odd = new Array(2); //vertex. To find this path, the backtrace() function is called,
} //constructing the path by following the content of the labels.
//Odd labels are similar, the only difference is that base nodes
//of blossoms inside other blossoms may have two. More on this later.

function elem() {
  //This is the element of the queue of labels to be analyzed by
  this.vertex = undefined;
  this.type = undefined; //the augmentMatching() procedure. Each element contains the vertex
} //where the label is and its type, odd or even.

var g = new Array(MAX); //The graph, as an adjacency matrix.
for (var i = 0; i < MAX; i++) {
  g[i] = new Array(MAX);
}
//blossom[i] contains the base node of the blossom the vertex i
var blossom = new Array(MAX); //is in. This, together with labels eliminates the need to
//contract the graph.

//The path arrays are where the backtrace() routine will
var path = new Array(2);
for (var i = 0; i < 2; i++) {
  path[i] = new Array(MAX);
}
var endPath = new Array(2); //store the paths it finds. Only two paths need to be
//stored. endPath[p] denotes the end of path[p].
var match = new Array(MAX); //An array of flags. match[i] stores if vertex i is in the matching.
//label[i] contains the label assigned to vertex i. It may be undefined,
var label = new Array(MAX); //empty (meaning the node is a root) and a node might have even and odd
//labels at the same time, which is the case for nonbase nodes of blossoms
for (var i = 0; i < MAX; i++) {
  label[i] = new Label();
}
var queue = new Array(2 * MAX); //The queue is necessary for efficiently scanning all labels.
var queueFront, queueBack; //A label is enqueued when assigned and dequeued after scanned.
for (var i = 0; i < 2 * MAX; i++) {
  queue[i] = new elem();
}

function initGraph(n) {
  for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) g[i][j] = noEdge;
}

function readGraph() {
  var n = graph.n,
    e = graph.e;

  //int n,e,a,b;
  //scanf(" %d %d",&n,&e);      //The graph is read and its edges are unmatched by default.
  initGraph(n); //Since C++ arrays are 0..n-1 and input 1..n , subtractions
  for (var i = 0; i < e; i++) {
    //are made for better memory usage.
    //scanf(" %d %d",&a,&b);
    var a = graph[i][0],
      b = graph[i][1];
    if (a != b) g[a - 1][b - 1] = g[b - 1][a - 1] = unmatched;
  }
  return n;
}

function initAlg(n) {
  //Initializes all data structures for the augmentMatching()
  queueFront = queueBack = 0; //function begin. At the start, all labels are undefined,
  for (var i = 0; i < n; i++) {
    //the queue is empty and a node alone is its own blossom.
    blossom[i] = i;
    label[i].even = label[i].odd[0] = label[i].odd[1] = undef;
  }
}

function backtrace(vert, pathNum, stop, parity, direction) {
  if (vert == stop) return;
  //pathNum is the number of the path to store
  else if (parity == 0) {
    //vert and parity determine the label to be read.
    if (direction == reverse) {
      backtrace(label[vert].even, pathNum, stop, (parity + 1) % 2, reverse);
      path[pathNum][endPath[pathNum]++] = vert;
    } //forward means the vertices called first enter
    else if (direction == forward) {
      //the path first, reverse is the opposite.
      path[pathNum][endPath[pathNum]++] = vert;
      backtrace(label[vert].even, pathNum, stop, (parity + 1) % 2, forward);
    }
  } else if (parity == 1 && label[vert].odd[1] == undef) {
    /*
       stop is the stopping condition for the recursion.
       Recursion is necessary because of the possible dual odd labels.
       having empty at stop means the recursion will only stop after
       the whole tree has been climbed. If assigned to a vertex, it'll stop
       once it's reached.
     */
    if (direction == reverse) {
      backtrace(label[vert].odd[0], pathNum, stop, (parity + 1) % 2, reverse);
      path[pathNum][endPath[pathNum]++] = vert;
    } else if (direction == forward) {
      path[pathNum][endPath[pathNum]++] = vert;
      backtrace(label[vert].odd[0], pathNum, stop, (parity + 1) % 2, forward);
    }
  } else if (parity == 1 && label[vert].odd[1] != undef) {
    /*
       Dual odd labels are interpreted as follows:
       There exists an odd length alternating path starting from the root to this
       vertex. To find this path, backtrace from odd[0] to the top of the tree and
       from odd[1] to the vertex itself. This, put in the right order, will
       constitute said path.
     */
    if (direction == reverse) {
      backtrace(label[vert].odd[0], pathNum, empty, (parity + 1) % 2, reverse);
      backtrace(label[vert].odd[1], pathNum, vert, (parity + 1) % 2, forward);
      path[pathNum][endPath[pathNum]++] = vert;
    } else if (direction == forward) {
      backtrace(label[vert].odd[1], pathNum, vert, (parity + 1) % 2, reverse);
      backtrace(label[vert].odd[0], pathNum, empty, (parity + 1) % 2, forward);
      path[pathNum][endPath[pathNum]++] = vert;
    }
  }
}

function enqueue(vert, t) {
  var tmp = new elem(); //Enqueues labels for scanning.
  tmp.vertex = vert; //No label that's dequeued during the execution
  tmp.type = t; //of augmentMatching() goes back to the queue.
  queue[queueBack++] = tmp; //Thus, circular arrays are unnecessary.
}

function newBlossom(a, b) {
  //newBlossom() will be called after the paths are evaluated.
  var i, base, innerBlossom, innerBase;
  for (i = 0; path[0][i] == path[1][i]; i++); //Find the lowest common ancestor of a and b
  i--; //it will be used to represent the blossom.
  base = blossom[path[0][i]]; //Unless it's already contained in another...
  //In this case, all will be put in the older one.
  for (var j = i; j < endPath[0]; j++) blossom[path[0][j]] = base;
  for (var j = i + 1; j < endPath[1]; j++) blossom[path[1][j]] = base; //Set all nodes to this
  for (var p = 0; p < 2; p++) {
    //new blossom.
    for (var j = i + 1; j < endPath[p] - 1; j++) {
      if (label[path[p][j]].even == undef) {
        //Now, new labels will be applied
        label[path[p][j]].even = path[p][j + 1]; //to indicate the existence of even
        enqueue(path[p][j], 0); //and odd length paths.
      } else if (
        label[path[p][j]].odd[0] == undef &&
        label[path[p][j + 1]].even == undef
      ) {
        label[path[p][j]].odd[0] = path[p][j + 1];
        enqueue(path[p][j], 1); //Labels will only be put if the vertex
      } //doesn't have one.
      else if (
        label[path[p][j]].odd[0] == undef &&
        label[path[p][j + 1]].even != undef
      ) {
        /*
                   If a vertex doesn't have an odd label, but the next one in the path
                   has an even label, it means that the current vertex is the base node
                   of a previous blossom and the next one is contained within it.
                   The standard labeling procedure will fail in this case. This is fixed
                   by going to the last node in the path inside this inner blossom and using
                   it to apply the dual label.
                   Refer to backtrace() to know how the path will be built.
                 */
        innerBlossom = blossom[path[p][j]];
        innerBase = j;
        for (; blossom[j] == innerBlossom && j < endPath[p] - 1; j++);
        j--;
        label[path[p][innerBase]].odd[0] = path[p][j + 1];
        label[path[p][innerBase]].odd[1] = path[p][j];
        enqueue(path[p][innerBase], 1);
      }
    }
  }
  if (g[a][b] == unmatched) {
    //All nodes have received labels, except
    if (label[a].odd[0] == undef) {
      //the ones that called the function in
      label[a].odd[0] = b; //the first place. It's possible to
      enqueue(a, 1); //find out how to label them by
    } //analyzing if they're in the matching.
    if (label[b].odd[0] == undef) {
      label[b].odd[0] = a;
      enqueue(b, 1);
    }
  } else if (g[a][b] == matched) {
    if (label[a].even == undef) {
      label[a].even = b;
      enqueue(a, 0);
    }
    if (label[b].even == undef) {
      label[b].even = a;
      enqueue(b, 0);
    }
  }
}

function augmentPath() {
  //An augmenting path has been found in the matching
  var a, b; //and is contained in the path arrays.
  for (var p = 0; p < 2; p++) {
    for (var i = 0; i < endPath[p] - 1; i++) {
      a = path[p][i]; //Because of labeling, this path is already
      b = path[p][i + 1]; //lifted and can be augmented by simple
      if (g[a][b] == unmatched)
        //changing of the matching status.
        g[a][b] = g[b][a] = matched;
      else if (g[a][b] == matched) g[a][b] = g[b][a] = unmatched;
    }
  }
  a = path[0][endPath[0] - 1];
  b = path[1][endPath[1] - 1];
  if (g[a][b] == unmatched) g[a][b] = g[b][a] = matched;
  else if (g[a][b] == matched) g[a][b] = g[b][a] = unmatched;
  //After this, a and b are included in the matching.
  match[path[0][0]] = match[path[1][0]] = true;
}

function augmentMatching(n) {
  //The main analyzing function, with the
  var node, nodeLabel; //goal of finding augmenting paths or
  initAlg(n); //concluding that the matching is maximum.
  for (var i = 0; i < n; i++)
    if (!match[i]) {
      label[i].even = empty;
      enqueue(i, 0); //Initialize the queue with the exposed vertices,
    } //making them the roots in the forest.

  while (queueFront < queueBack) {
    node = queue[queueFront].vertex;
    nodeLabel = queue[queueFront].type;
    if (nodeLabel == 0) {
      for (var i = 0; i < n; i++)
        if (g[node][i] == unmatched) {
          if (blossom[node] == blossom[i]);
          else if (label[i].even != undef) {
            //Do nothing. Edges inside the same blossom have no meaning.
            /*
                       The tree has reached a vertex with a label.
                       The parity of this label indicates that an odd length
                       alternating path has been found. If this path is between
                       roots, we have an augmenting path, else there's an
                       alternating cycle, a blossom.
                     */
            endPath[0] = endPath[1] = 0;
            backtrace(node, 0, empty, 0, reverse);
            backtrace(i, 1, empty, 0, reverse);
            //Call the backtracing function to find out.
            if (path[0][0] == path[1][0]) newBlossom(node, i);
            /*
                       If the same root node is reached, a blossom was found.
                       Start the labelling procedure to create pseudo-contraction.
                     */ else {
              augmentPath();
              return true;
              /*
                            If the roots are different, we have an augmenting path.
                            Improve the matching by augmenting this path.
                            Now some labels might make no sense, stop the function,
                            returning that it was successful in improving.
                          */
            }
          } else if (label[i].even == undef && label[i].odd[0] == undef) {
            //If an unseen vertex is found, report the existing path
            //by labeling it accordingly.
            label[i].odd[0] = node;
            enqueue(i, 1);
          }
        }
    } else if (nodeLabel == 1) {
      //Similar to above.
      for (var i = 0; i < n; i++)
        if (g[node][i] == matched) {
          if (blossom[node] == blossom[i]);
          else if (label[i].odd[0] != undef) {
            endPath[0] = endPath[1] = 0;
            backtrace(node, 0, empty, 1, reverse);
            backtrace(i, 1, empty, 1, reverse);
            if (path[0][0] == path[1][0]) newBlossom(node, i);
            else {
              augmentPath();
              return true;
            }
          } else if (label[i].even == undef && label[i].odd[0] == undef) {
            label[i].even = node;
            enqueue(i, 0);
          }
        }
    }
    /*
           The scanning of this label is complete, dequeue it and
           keep going to the next one.
         */
    queueFront++;
  }
  /*
       If the function reaches this point, the queue is empty, all
       labels have been scanned. The algorithm couldn't find an augmenting
       path. Therefore, it concludes the matching is maximum.
     */
  return false;
}

function findMaximumMatching(n) {
  //Initialize it with the empty matching.
  for (var i = 0; i < n; i++) match[i] = false;
  //Run augmentMatching(), it'll keep improving the matching.
  //Eventually, it will no longer find a path and break the loop,
  //at this point, the current matching is maximum.
  while (augmentMatching(n));
  return g;
}

function buildGraph(matches, people) {
  let graph = [];
  let count = Object.keys(people).length + 1;
  let edges = 0;
  for (var i = 1; i < count; i++) {
    for (var j = i + 1; j < count; j++) {
      if (!people[i].added || !people[j].added) continue;

      let matched = false;

      // find out if they already matched
      for (var k in matches) {
        for (var m in matches[k]) {
          if (
            (matches[k][m][0] == i && matches[k][m][1] == j) ||
            (matches[k][m][0] == j && matches[k][m][1] == i)
          ) {
            matched = true;
            break;
          }
        }
        if (matched) break;
      }

      if (!matched) {
        graph.push([i, j]);
        edges++;
      }
    }
  }
  graph["n"] = count - 1;
  graph["e"] = edges;

  return graph;
}

function matchPeople(matches, people) {
  graph = buildGraph(matches, people);
  let n = readGraph();
  let g = findMaximumMatching(n);

  let m = [];

  for (var i = 0; i < n; i++)
    for (var j = i + 1; j < n; j++) if (g[i][j] == 2) m.push([i + 1, j + 1]);

  if (m.length > 0) {
    matches.push(m);
  }

  return {
    result: m.length > 0,
    matches: matches,
    match: m
  };
}

module.exports = {
  matchPeople: matchPeople
};
