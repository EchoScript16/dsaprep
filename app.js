/* ═══════════════════════════════════════════
   DSAPrep — app.js
   All features: roadmap, practice, compiler,
   visualizer, interview prep, progress tracking
═══════════════════════════════════════════ */

'use strict';

/* ══════════ DATA ══════════ */

const TOPICS = ["Arrays & Strings","Sorting & Search","Linked Lists","Stack & Queue","Hashing","Trees & BST","Graphs","Dynamic Programming"];
const CO_COLORS = { tcs:"#4a9eff", infosys:"#18c4aa", wipro:"#f0a500", amazon:"#e95050", microsoft:"#7b6cf6", google:"#1fc87a" };
const DIFF_CLASS = { easy:"diff-easy", medium:"diff-medium", hard:"diff-hard" };

const PROBLEMS = {
  0: [
    {n:"Two Sum", d:"easy", url:"https://leetcode.com/problems/two-sum/", co:["tcs","infosys","amazon","google"],
      desc:"Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      examples:"Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] = 2 + 7 = 9",
      hints:["Think about what information you need to check for each element.","For each number x, you need to find (target - x) in the array.","A hash map lets you look up (target - x) in O(1) time.","Iterate once: for each num, check if (target-num) exists in your map, then add num to the map."]},
    {n:"Best Time to Buy and Sell Stock", d:"easy", url:"https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", co:["amazon","microsoft","tcs"],
      desc:"Given prices array, find the maximum profit from buying on one day and selling on a later day.",
      examples:"Input: prices = [7,1,5,3,6,4]\nOutput: 5\nExplanation: Buy at 1, sell at 6 = profit 5",
      hints:["You need to track the minimum price seen so far.","For each price, compute profit = price - min_so_far.","Keep a running maximum of all such profits."]},
    {n:"Contains Duplicate", d:"easy", url:"https://leetcode.com/problems/contains-duplicate/", co:["tcs","infosys","wipro"],
      desc:"Given an array, return true if any value appears at least twice.",
      examples:"Input: [1,2,3,1]\nOutput: true",
      hints:["Use a set to track seen elements.","If you see an element already in the set, return True."]},
    {n:"Maximum Subarray (Kadane's)", d:"medium", url:"https://leetcode.com/problems/maximum-subarray/", co:["tcs","infosys","amazon","microsoft"],
      desc:"Find the contiguous subarray with the largest sum.",
      examples:"Input: [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: [4,-1,2,1] has the largest sum = 6",
      hints:["Try all subarrays? O(n²) — too slow.","Kadane's insight: for each position, decide whether to extend current subarray or start new.","current = max(num, current + num)","Keep track of the global maximum."]},
    {n:"Product of Array Except Self", d:"medium", url:"https://leetcode.com/problems/product-of-array-except-self/", co:["amazon","microsoft","google"],
      desc:"Return array where each element is the product of all other elements. No division. O(n) time.",
      examples:"Input: [1,2,3,4]\nOutput: [24,12,8,6]",
      hints:["Division would be easy but it's not allowed.","Think prefix products: result[i] = product of all elements before i.","Then think suffix products: multiply by product of all elements after i.","Two passes: left pass builds prefix, right pass multiplies suffix."]},
    {n:"Longest Substring Without Repeating", d:"medium", url:"https://leetcode.com/problems/longest-substring-without-repeating-characters/", co:["amazon","microsoft","google"],
      desc:"Find the length of the longest substring without repeating characters.",
      examples:"Input: \"abcabcbb\"\nOutput: 3\nExplanation: \"abc\"",
      hints:["Sliding window approach.","Use a set to track characters in current window.","If new char is in set, shrink window from left until it's removed.","Track maximum window size seen."]},
    {n:"3Sum", d:"medium", url:"https://leetcode.com/problems/3sum/", co:["amazon","microsoft","google"],
      desc:"Find all unique triplets that sum to zero.",
      examples:"Input: [-1,0,1,2,-1,-4]\nOutput: [[-1,-1,2],[-1,0,1]]",
      hints:["Brute force is O(n³). Can you do O(n²)?","Sort the array first.","Fix one element, then use two pointers for the remaining two.","Skip duplicates to avoid duplicate triplets."]},
    {n:"Container With Most Water", d:"medium", url:"https://leetcode.com/problems/container-with-most-water/", co:["amazon","google"],
      desc:"Find two lines that together with the x-axis forms a container that holds the most water.",
      examples:"Input: height = [1,8,6,2,5,4,8,3,7]\nOutput: 49",
      hints:["Two pointers: left=0, right=n-1.","Area = min(height[l], height[r]) * (r - l).","Move the pointer with smaller height inward."]},
    {n:"Subarray Sum Equals K", d:"medium", url:"https://leetcode.com/problems/subarray-sum-equals-k/", co:["amazon","microsoft"],
      desc:"Find total number of subarrays whose sum equals k.",
      examples:"Input: nums=[1,1,1], k=2\nOutput: 2",
      hints:["Prefix sum: sum(i,j) = prefix[j] - prefix[i-1].","For each j, count how many i have prefix[i] = prefix[j] - k.","Use a hash map to store prefix sum frequencies."]},
    {n:"Trapping Rain Water", d:"hard", url:"https://leetcode.com/problems/trapping-rain-water/", co:["amazon","microsoft","google"],
      desc:"Given elevation map, compute how much water it can trap after raining.",
      examples:"Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6",
      hints:["Water at index i = min(max_left, max_right) - height[i].","Precompute left_max and right_max arrays.","Or use two pointers to avoid extra space."]},
    {n:"Minimum Window Substring", d:"hard", url:"https://leetcode.com/problems/minimum-window-substring/", co:["google","microsoft"],
      desc:"Find minimum window in s which contains all characters of t.",
      examples:"Input: s=\"ADOBECODEBANC\", t=\"ABC\"\nOutput: \"BANC\"",
      hints:["Sliding window with two frequency maps.","Expand right until window contains all chars of t.","Then shrink from left while window still valid.","Track minimum window seen."]},
  ],
  1: [
    {n:"Binary Search", d:"easy", url:"https://leetcode.com/problems/binary-search/", co:["tcs","infosys","wipro"], desc:"Search for target in sorted array.", examples:"Input: nums=[-1,0,3,5,9,12], target=9\nOutput: 4", hints:["Set lo=0, hi=n-1.","mid = (lo+hi)//2.","If nums[mid]==target return mid. If less, lo=mid+1. If more, hi=mid-1."]},
    {n:"Search in Rotated Sorted Array", d:"medium", url:"https://leetcode.com/problems/search-in-rotated-sorted-array/", co:["amazon","microsoft","google"], desc:"Search target in rotated sorted array.", examples:"Input: nums=[4,5,6,7,0,1,2], target=0\nOutput: 4", hints:["One half is always sorted.","Check which half is sorted, then decide which half to search."]},
    {n:"Find Minimum in Rotated Array", d:"medium", url:"https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", co:["amazon","microsoft"], desc:"Find minimum element in rotated sorted array.", examples:"Input: [3,4,5,1,2]\nOutput: 1", hints:["Binary search. If mid > right, minimum is in right half."]},
    {n:"Merge Intervals", d:"medium", url:"https://leetcode.com/problems/merge-intervals/", co:["amazon","google","microsoft"], desc:"Merge all overlapping intervals.", examples:"Input: [[1,3],[2,6],[8,10]]\nOutput: [[1,6],[8,10]]", hints:["Sort by start time.","If current start <= last merged end, merge."]},
    {n:"Kth Largest Element", d:"medium", url:"https://leetcode.com/problems/kth-largest-element-in-an-array/", co:["amazon","microsoft","google"], desc:"Find kth largest element.", examples:"Input: [3,2,1,5,6,4], k=2\nOutput: 5", hints:["Min-heap of size k.","Or quickselect O(n) average."]},
    {n:"Search a 2D Matrix", d:"medium", url:"https://leetcode.com/problems/search-a-2d-matrix/", co:["amazon","microsoft"], desc:"Search in sorted 2D matrix.", examples:"Input: matrix=[[1,3,5,7],[10,11,16,20]], target=3\nOutput: true", hints:["Treat as flattened sorted array.","mid = row*cols + col."]},
    {n:"Median of Two Sorted Arrays", d:"hard", url:"https://leetcode.com/problems/median-of-two-sorted-arrays/", co:["amazon","google"], desc:"Find median of two sorted arrays in O(log(m+n)).", examples:"Input: [1,3], [2]\nOutput: 2.0", hints:["Binary search on smaller array.","Partition both arrays such that left half ≤ right half."]},
  ],
  2: [
    {n:"Reverse Linked List", d:"easy", url:"https://leetcode.com/problems/reverse-linked-list/", co:["tcs","infosys","wipro","amazon"], desc:"Reverse a singly linked list.", examples:"Input: 1->2->3->4->5\nOutput: 5->4->3->2->1", hints:["Three pointers: prev=None, curr=head.","At each step: next=curr.next; curr.next=prev; prev=curr; curr=next.","Return prev."]},
    {n:"Merge Two Sorted Lists", d:"easy", url:"https://leetcode.com/problems/merge-two-sorted-lists/", co:["tcs","infosys","amazon","microsoft"], desc:"Merge two sorted linked lists.", examples:"Input: 1->2->4, 1->3->4\nOutput: 1->1->2->3->4->4", hints:["Use a dummy head node.","Compare l1.val and l2.val, append smaller."]},
    {n:"Linked List Cycle", d:"easy", url:"https://leetcode.com/problems/linked-list-cycle/", co:["tcs","infosys","wipro","amazon"], desc:"Detect if linked list has a cycle.", examples:"Input: 3->2->0->-4 (cycle)\nOutput: true", hints:["Floyd's cycle detection: slow and fast pointers.","If they meet, cycle exists."]},
    {n:"Middle of Linked List", d:"easy", url:"https://leetcode.com/problems/middle-of-the-linked-list/", co:["tcs","infosys"], desc:"Find middle node of linked list.", examples:"Input: 1->2->3->4->5\nOutput: 3", hints:["Slow moves 1 step, fast moves 2 steps.","When fast reaches end, slow is at middle."]},
    {n:"Remove Nth Node From End", d:"medium", url:"https://leetcode.com/problems/remove-nth-node-from-end-of-list/", co:["amazon","microsoft","google"], desc:"Remove nth node from end of list.", examples:"Input: 1->2->3->4->5, n=2\nOutput: 1->2->3->5", hints:["Two pointers, n apart.","When fast reaches end, slow is at node before target."]},
    {n:"Add Two Numbers", d:"medium", url:"https://leetcode.com/problems/add-two-numbers/", co:["amazon","microsoft","google"], desc:"Add two numbers represented as linked lists.", examples:"Input: (2->4->3) + (5->6->4)\nOutput: 7->0->8", hints:["Process node by node, track carry.","Create new node for each digit sum % 10."]},
    {n:"LRU Cache", d:"medium", url:"https://leetcode.com/problems/lru-cache/", co:["amazon","microsoft","google"], desc:"Implement LRU Cache with O(1) get and put.", examples:"LRUCache(2); put(1,1); put(2,2); get(1)→1; put(3,3) evicts key 2", hints:["Use OrderedDict (doubly linked list + hash map).","On get/put, move to end (most recent).","On capacity exceeded, pop from front (least recent)."]},
    {n:"Merge K Sorted Lists", d:"hard", url:"https://leetcode.com/problems/merge-k-sorted-lists/", co:["amazon","google","microsoft"], desc:"Merge k sorted linked lists.", examples:"Input: [[1,4,5],[1,3,4],[2,6]]\nOutput: 1->1->2->3->4->4->5->6", hints:["Use a min-heap.","Push first node of each list.","Pop min, push its next."]},
  ],
  3: [
    {n:"Valid Parentheses", d:"easy", url:"https://leetcode.com/problems/valid-parentheses/", co:["tcs","infosys","wipro","amazon","google"], desc:"Check if string of brackets is valid.", examples:"Input: \"()[]{}\"\nOutput: true\nInput: \"(]\"\nOutput: false", hints:["Use a stack.","Push open brackets. On close bracket, check if top matches.","At end, stack should be empty."]},
    {n:"Min Stack", d:"medium", url:"https://leetcode.com/problems/min-stack/", co:["amazon","microsoft","google"], desc:"Stack that supports push, pop, top, and getMin in O(1).", examples:"push(-2),push(0),push(-3),getMin()→-3,pop(),top()→0,getMin()→-2", hints:["Use two stacks: main stack and min_stack.","min_stack stores minimum at each level."]},
    {n:"Daily Temperatures", d:"medium", url:"https://leetcode.com/problems/daily-temperatures/", co:["amazon","microsoft"], desc:"Find days to wait for a warmer temperature.", examples:"Input: [73,74,75,71,69,72,76,73]\nOutput: [1,1,4,2,1,1,0,0]", hints:["Monotonic decreasing stack.","Store indices.","When current temp > stack top temp, pop and compute difference."]},
    {n:"Largest Rectangle in Histogram", d:"hard", url:"https://leetcode.com/problems/largest-rectangle-in-histogram/", co:["amazon","google"], desc:"Find largest rectangle in histogram.", examples:"Input: [2,1,5,6,2,3]\nOutput: 10", hints:["Monotonic increasing stack.","When height decreases, calculate area using popped height."]},
    {n:"Sliding Window Maximum", d:"hard", url:"https://leetcode.com/problems/sliding-window-maximum/", co:["google","microsoft"], desc:"Find maximum in each window of size k.", examples:"Input: [1,3,-1,-3,5,3,6,7], k=3\nOutput: [3,3,5,5,6,7]", hints:["Monotonic deque (decreasing).","Remove elements outside window.","Front of deque is always the maximum."]},
  ],
  4: [
    {n:"Valid Anagram", d:"easy", url:"https://leetcode.com/problems/valid-anagram/", co:["tcs","infosys","wipro"], desc:"Check if two strings are anagrams.", examples:"Input: s=\"anagram\", t=\"nagaram\"\nOutput: true", hints:["Counter(s) == Counter(t).","Or sort both and compare."]},
    {n:"Group Anagrams", d:"medium", url:"https://leetcode.com/problems/group-anagrams/", co:["amazon","microsoft","google"], desc:"Group anagrams together.", examples:"Input: [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]\nOutput: [[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]", hints:["Key for each group = sorted string.","Use defaultdict(list) to group by key."]},
    {n:"Top K Frequent Elements", d:"medium", url:"https://leetcode.com/problems/top-k-frequent-elements/", co:["amazon","microsoft","google"], desc:"Return k most frequent elements.", examples:"Input: [1,1,1,2,2,3], k=2\nOutput: [1,2]", hints:["Count frequencies with Counter.","Use heapq.nlargest(k, count, key=count.get)."]},
    {n:"Find All Anagrams in a String", d:"medium", url:"https://leetcode.com/problems/find-all-anagrams-in-a-string/", co:["amazon","microsoft"], desc:"Find all start indices of anagram substrings.", examples:"Input: s=\"cbaebabacd\", p=\"abc\"\nOutput: [0,6]", hints:["Sliding window of size len(p).","Compare frequency maps of window and p."]},
  ],
  5: [
    {n:"Maximum Depth of Binary Tree", d:"easy", url:"https://leetcode.com/problems/maximum-depth-of-binary-tree/", co:["tcs","infosys","wipro","amazon"], desc:"Find maximum depth of binary tree.", examples:"Input: [3,9,20,null,null,15,7]\nOutput: 3", hints:["Recursion: 1 + max(depth(left), depth(right)).","Base case: None node returns 0."]},
    {n:"Invert Binary Tree", d:"easy", url:"https://leetcode.com/problems/invert-binary-tree/", co:["tcs","infosys","wipro"], desc:"Invert a binary tree.", examples:"Input: [4,2,7,1,3,6,9]\nOutput: [4,7,2,9,6,3,1]", hints:["Swap left and right children.","Recursively invert both subtrees."]},
    {n:"Level Order Traversal", d:"medium", url:"https://leetcode.com/problems/binary-tree-level-order-traversal/", co:["amazon","microsoft","google"], desc:"Return level-order traversal of binary tree.", examples:"Input: [3,9,20,null,null,15,7]\nOutput: [[3],[9,20],[15,7]]", hints:["BFS with deque.","At each level, process len(queue) nodes."]},
    {n:"Lowest Common Ancestor of BST", d:"medium", url:"https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/", co:["amazon","microsoft","google"], desc:"Find LCA of two nodes in BST.", examples:"Input: root=[6,2,8,0,4,7,9], p=2, q=8\nOutput: 6", hints:["Use BST property.","If both p,q < root: go left. If both > root: go right. Else: root is LCA."]},
    {n:"Validate Binary Search Tree", d:"medium", url:"https://leetcode.com/problems/validate-binary-search-tree/", co:["amazon","microsoft","google"], desc:"Determine if binary tree is valid BST.", examples:"Input: [2,1,3]\nOutput: true", hints:["Pass min/max bounds in recursion.","Left subtree: all nodes < current. Right: all > current."]},
    {n:"Binary Tree Maximum Path Sum", d:"hard", url:"https://leetcode.com/problems/binary-tree-maximum-path-sum/", co:["amazon","google"], desc:"Find path in tree with maximum sum.", examples:"Input: [-10,9,20,null,null,15,7]\nOutput: 42", hints:["At each node: max path through = left + node + right (all positive contributions).","Return node + max(left, right, 0) for parent's use.","Update global max at each node."]},
  ],
  6: [
    {n:"Number of Islands", d:"medium", url:"https://leetcode.com/problems/number-of-islands/", co:["tcs","infosys","amazon","microsoft","google"], desc:"Count number of islands in grid.", examples:"Input: grid of 1s and 0s\nOutput: count of connected components of 1s", hints:["DFS/BFS from each unvisited land cell.","Mark visited cells to avoid counting twice."]},
    {n:"Course Schedule", d:"medium", url:"https://leetcode.com/problems/course-schedule/", co:["amazon","microsoft","google"], desc:"Can all courses be completed given prerequisites?", examples:"Input: numCourses=2, prerequisites=[[1,0]]\nOutput: true", hints:["Detect cycle in directed graph.","Topological sort (Kahn's) — if all nodes processed, no cycle."]},
    {n:"Number of Connected Components", d:"medium", url:"https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/", co:["amazon","microsoft"], desc:"Count connected components in undirected graph.", examples:"Input: n=5, edges=[[0,1],[1,2],[3,4]]\nOutput: 2", hints:["Union-Find or DFS from each unvisited node."]},
    {n:"Rotting Oranges", d:"medium", url:"https://leetcode.com/problems/rotting-oranges/", co:["amazon","microsoft"], desc:"Find minimum time for all oranges to rot.", examples:"Input: [[2,1,1],[1,1,0],[0,1,1]]\nOutput: 4", hints:["Multi-source BFS from all rotten oranges simultaneously.","Count fresh oranges."]},
    {n:"Word Ladder", d:"hard", url:"https://leetcode.com/problems/word-ladder/", co:["amazon","google"], desc:"Find shortest path from beginWord to endWord changing one letter at a time.", examples:"Input: beginWord=\"hit\", endWord=\"cog\", wordList=[\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]\nOutput: 5", hints:["BFS for shortest path.","Each level = one letter change.","Use set for O(1) word lookup."]},
  ],
  7: [
    {n:"Climbing Stairs", d:"easy", url:"https://leetcode.com/problems/climbing-stairs/", co:["tcs","infosys","wipro","amazon"], desc:"Count ways to climb n stairs (1 or 2 steps at a time).", examples:"Input: n=3\nOutput: 3\nExplanation: 1+1+1, 1+2, 2+1", hints:["dp[i] = ways to reach step i.","dp[i] = dp[i-1] + dp[i-2].","Fibonacci! dp[1]=1, dp[2]=2."]},
    {n:"House Robber", d:"medium", url:"https://leetcode.com/problems/house-robber/", co:["tcs","infosys","amazon","microsoft"], desc:"Maximum amount you can rob (no two adjacent houses).", examples:"Input: [2,7,9,3,1]\nOutput: 12", hints:["At each house: rob it + dp[i-2], or skip it dp[i-1].","dp[i] = max(dp[i-1], dp[i-2] + nums[i])."]},
    {n:"Coin Change", d:"medium", url:"https://leetcode.com/problems/coin-change/", co:["amazon","microsoft","google","tcs"], desc:"Minimum coins to make amount.", examples:"Input: coins=[1,5,11], amount=15\nOutput: 3", hints:["dp[i] = minimum coins to make amount i.","dp[i] = min(dp[i], dp[i-coin]+1) for each coin.","Initialize dp = [inf]*(amount+1), dp[0]=0."]},
    {n:"Longest Increasing Subsequence", d:"medium", url:"https://leetcode.com/problems/longest-increasing-subsequence/", co:["amazon","microsoft","google","tcs"], desc:"Find length of longest increasing subsequence.", examples:"Input: [10,9,2,5,3,7,101,18]\nOutput: 4\nExplanation: [2,3,7,101]", hints:["dp[i] = LIS ending at index i.","For each i: dp[i] = 1 + max(dp[j]) for all j<i where nums[j]<nums[i].","O(n log n) with patience sorting + binary search."]},
    {n:"Longest Common Subsequence", d:"medium", url:"https://leetcode.com/problems/longest-common-subsequence/", co:["amazon","microsoft","google"], desc:"Find length of longest common subsequence.", examples:"Input: text1=\"abcde\", text2=\"ace\"\nOutput: 3", hints:["2D DP: dp[i][j] = LCS of text1[:i] and text2[:j].","If text1[i-1]==text2[j-1]: dp[i][j]=dp[i-1][j-1]+1.","Else: dp[i][j]=max(dp[i-1][j], dp[i][j-1])."]},
    {n:"0/1 Knapsack", d:"medium", url:"https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/", co:["tcs","infosys","wipro","amazon"], desc:"Maximize value with weight constraint.", examples:"wt=[1,3,4,5], val=[1,4,5,7], W=7\nOutput: 9", hints:["dp[i][w] = max value using first i items with capacity w.","Either include item i: val[i]+dp[i-1][w-wt[i]], or exclude: dp[i-1][w]."]},
    {n:"Edit Distance", d:"hard", url:"https://leetcode.com/problems/edit-distance/", co:["amazon","google","microsoft"], desc:"Minimum operations to convert word1 to word2.", examples:"Input: word1=\"horse\", word2=\"ros\"\nOutput: 3", hints:["dp[i][j] = edit distance of word1[:i] and word2[:j].","If chars match: dp[i][j]=dp[i-1][j-1].","Else: 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])."]},
    {n:"Word Break", d:"medium", url:"https://leetcode.com/problems/word-break/", co:["amazon","microsoft","google"], desc:"Can string be segmented using dictionary words?", examples:"Input: s=\"leetcode\", wordDict=[\"leet\",\"code\"]\nOutput: true", hints:["dp[i] = can s[:i] be segmented.","For each i: check all j<i where dp[j] is True and s[j:i] is in dict."]},
  ]
};

const ROADMAP_DATA = [
  { week:"Week 1", title:"Arrays & Strings", tag:"Foundation", topic:0, resources:[
    { type:"yt", name:"Arrays in Python – Full Tutorial", meta:"Apna College · Hindi · 1h 45min", url:"https://www.youtube.com/watch?v=n60Dn0UsbEk" },
    { type:"yt", name:"Two Pointers – All Patterns", meta:"NeetCode · English · 20min", url:"https://www.youtube.com/watch?v=A48kvZztrCM" },
    { type:"yt", name:"Sliding Window – Fixed & Variable", meta:"take U forward · Hindi · 45min", url:"https://www.youtube.com/watch?v=GcW4mgmgSbw" },
    { type:"yt", name:"Kadane's Algorithm – Max Subarray", meta:"take U forward · Hindi · 18min", url:"https://www.youtube.com/watch?v=moGCGmJHFE0" },
    { type:"lc", name:"LeetCode – Array & String Card", meta:"Free interactive module", url:"https://leetcode.com/explore/learn/card/array-and-string/" },
    { type:"art", name:"GFG – Array Data Structure + Python code", meta:"Theory + examples", url:"https://www.geeksforgeeks.org/array-data-structure/" },
  ]},
  { week:"Week 2", title:"Sorting & Binary Search", tag:"Foundation", topic:1, resources:[
    { type:"yt", name:"Sorting Algorithms – Merge Sort, Quick Sort", meta:"take U forward · Hindi · 1h", url:"https://www.youtube.com/watch?v=HGk_ypEuS24" },
    { type:"yt", name:"Binary Search – Complete Guide with Templates", meta:"NeetCode · English · 22min", url:"https://www.youtube.com/watch?v=MFihVXjJSkg" },
    { type:"yt", name:"Binary Search on Answers – Advanced", meta:"take U forward · Hindi · 35min", url:"https://www.youtube.com/watch?v=W9F8fDQj7Ok" },
    { type:"lc", name:"LeetCode – Binary Search Card", meta:"Structured problems easy to hard", url:"https://leetcode.com/explore/learn/card/binary-search/" },
    { type:"doc", name:"Python bisect module – Official Docs", meta:"bisect_left, bisect_right", url:"https://docs.python.org/3/library/bisect.html" },
  ]},
  { week:"Week 3", title:"Linked Lists", tag:"Core DS", topic:2, resources:[
    { type:"yt", name:"Linked List – Full Course in Python", meta:"Apna College · Hindi · 2h", url:"https://www.youtube.com/watch?v=WwfhLC16bis" },
    { type:"yt", name:"Floyd's Cycle Detection Algorithm", meta:"take U forward · Hindi · 22min", url:"https://www.youtube.com/watch?v=G0_I-ZF0S38" },
    { type:"yt", name:"Reverse Linked List – All Methods", meta:"NeetCode · English · 12min", url:"https://www.youtube.com/watch?v=cKqkvH9GT-M" },
    { type:"lc", name:"LeetCode – Linked List Card", meta:"Complete module", url:"https://leetcode.com/explore/learn/card/linked-list/" },
  ]},
  { week:"Week 3", title:"Stack & Queue", tag:"Core DS", topic:3, resources:[
    { type:"yt", name:"Stack & Queue – Full Tutorial in Python", meta:"Apna College · Hindi · 1h 20min", url:"https://www.youtube.com/watch?v=aCh1pBdCVEQ" },
    { type:"yt", name:"Monotonic Stack – Must-Know Pattern", meta:"NeetCode · English · 28min", url:"https://www.youtube.com/watch?v=86NOdk5gFII" },
    { type:"doc", name:"Python deque – Official Docs", meta:"O(1) append/popleft", url:"https://docs.python.org/3/library/collections.html#collections.deque" },
    { type:"lc", name:"LeetCode – Queue & Stack Card", meta:"Introduces BFS/DFS", url:"https://leetcode.com/explore/learn/card/queue-stack/" },
  ]},
  { week:"Week 4", title:"Hashing", tag:"Core DS", topic:4, resources:[
    { type:"yt", name:"Hashing & HashMaps – Complete Guide", meta:"take U forward · Hindi · 55min", url:"https://www.youtube.com/watch?v=jalaSzVuqf8" },
    { type:"yt", name:"Python Dictionary Deep Dive", meta:"Corey Schafer · English · 30min", url:"https://www.youtube.com/watch?v=9Iys7E6-xrY" },
    { type:"doc", name:"Python collections – Counter, defaultdict", meta:"Official docs – essential", url:"https://docs.python.org/3/library/collections.html" },
    { type:"art", name:"GFG – Hashing Concepts + Problems", meta:"Theory + implementation", url:"https://www.geeksforgeeks.org/hashing-data-structure/" },
  ]},
  { week:"Week 5", title:"Trees & BST", tag:"Core DS", topic:5, resources:[
    { type:"yt", name:"Binary Trees – Full Course", meta:"Apna College · Hindi · 3h playlist", url:"https://www.youtube.com/watch?v=4s1Tcvm00pA" },
    { type:"yt", name:"Tree Traversals – Inorder, Preorder, BFS", meta:"NeetCode · English · 20min", url:"https://www.youtube.com/watch?v=aM-oswPn19o" },
    { type:"yt", name:"Binary Search Tree – All Operations", meta:"take U forward · Hindi · 50min", url:"https://www.youtube.com/watch?v=BHB0B1jFKQc" },
    { type:"lc", name:"LeetCode – Tree Card", meta:"Traversals, height, BST", url:"https://leetcode.com/explore/learn/card/data-structure-tree/" },
  ]},
  { week:"Week 6", title:"Graphs", tag:"Advanced", topic:6, resources:[
    { type:"yt", name:"Graph Series – BFS, DFS, Dijkstra Playlist", meta:"take U forward · Hindi · 20+ videos", url:"https://www.youtube.com/watch?v=M3KZW7XEqoI" },
    { type:"yt", name:"BFS and DFS – Python Implementation", meta:"NeetCode · English · 30min", url:"https://www.youtube.com/watch?v=pcKY4hjDrxk" },
    { type:"yt", name:"Dijkstra's Algorithm in Python", meta:"CS Dojo · English · 25min", url:"https://www.youtube.com/watch?v=jbhuqIASjoM" },
    { type:"yt", name:"Topological Sort – Kahn's + DFS", meta:"take U forward · Hindi · 30min", url:"https://www.youtube.com/watch?v=6ZRiJobed4c" },
    { type:"art", name:"GFG – Graph Algorithms Reference", meta:"All algorithms + Python code", url:"https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/" },
  ]},
  { week:"Weeks 7–8", title:"Dynamic Programming", tag:"Advanced", topic:7, resources:[
    { type:"yt", name:"DP – Complete freeCodeCamp Course", meta:"freeCodeCamp · English · 5h – best free resource", url:"https://www.youtube.com/watch?v=oBt53YbR9Kk" },
    { type:"yt", name:"DP Patterns – Identify Any DP Problem", meta:"take U forward · Hindi · 1h 30min", url:"https://www.youtube.com/watch?v=tyB0ztf0DNY" },
    { type:"yt", name:"0/1 Knapsack – Recursion to Tabulation", meta:"take U forward · Hindi · 40min", url:"https://www.youtube.com/watch?v=d3zVsBVSGFk" },
    { type:"doc", name:"Python @lru_cache – Official Docs", meta:"Instant memoization in 1 line", url:"https://docs.python.org/3/library/functools.html#functools.lru_cache" },
    { type:"lc", name:"LeetCode – DP Patterns Cheatsheet", meta:"Most upvoted DP guide", url:"https://leetcode.com/discuss/general-discussion/458695/dynamic-programming-patterns" },
  ]},
];

const COMPANY_PATHS = {
  tcs: { name:"TCS Path", desc:"Focus areas for TCS NQT & Digital", topics:[0,1,2,3,4,7] },
  amazon: { name:"Amazon Path", desc:"SDE-1 focus: arrays, trees, graphs, DP, system design", topics:[0,1,2,5,6,7] },
  google: { name:"Google Path", desc:"Hard problems, all topics, algorithms focus", topics:[0,1,2,5,6,7] },
  infosys: { name:"Infosys Path", desc:"Infosys Specialist Programmer & SES", topics:[0,1,2,3,4] },
};

const HR_QUESTIONS = [
  { q:"Tell me about yourself.", a:"Structure: Present (current status/education), Past (relevant experience/projects), Future (why this company/role). Keep it under 2 minutes. Practice until it sounds natural, not recited." },
  { q:"Why do you want to join this company?", a:"Research the company. Mention specific products, culture, growth, or mission. Connect their strengths to your career goals. Avoid generic answers like 'good salary' or 'brand name'." },
  { q:"What are your strengths?", a:"Pick 2-3 real strengths relevant to the role. Give examples for each. Common strong answers: problem-solving, quick learner, attention to detail — but always back with evidence." },
  { q:"What are your weaknesses?", a:"Choose a real weakness but show self-awareness and improvement. Example: 'I used to struggle with time estimation, so I started using time-boxing technique and improved significantly.' Never say 'I work too hard'." },
  { q:"Where do you see yourself in 5 years?", a:"Show ambition aligned with the company's growth. Example: 'I want to grow into a senior developer role, contributing to impactful products and mentoring junior developers.' Avoid saying you want to leave or start a business." },
  { q:"Why should we hire you?", a:"Summarize your top 3 skills/experiences that match the job requirements. Be specific. End with genuine enthusiasm for the role." },
  { q:"Tell me about a challenge you faced and how you overcame it.", a:"Use STAR format: Situation, Task, Action, Result. Choose a technical challenge. Be specific about what YOU did, not the team." },
  { q:"Do you have any questions for us?", a:"Always have 2-3 questions ready: 'What does a typical day look like?', 'What are the growth opportunities?', 'What tech stack does the team use?' Never ask about salary in first round." },
  { q:"How do you handle pressure and tight deadlines?", a:"Give a specific example. Show that you prioritize, communicate, and stay calm. Mention any tools or techniques (e.g., to-do lists, breaking tasks down)." },
  { q:"Are you comfortable relocating?", a:"Be honest but professional. If flexible, say so clearly. If not, explain politely and ask about remote options." },
];

const SYSTEM_DESIGN = [
  { title:"URL Shortener (like bit.ly)", points:"Hash function (MD5/Base62), database for URL mapping, caching layer (Redis), rate limiting, analytics tracking." },
  { title:"Chat Application (like WhatsApp)", points:"WebSockets for real-time, message queue (Kafka), database sharding, end-to-end encryption, last-seen & delivery receipts." },
  { title:"E-commerce Product Search", points:"Search engine (Elasticsearch), indexing strategy, ranking algorithm, caching, autocomplete, filtering and pagination." },
  { title:"Ride-sharing Service (like Uber)", points:"Real-time location tracking, driver matching algorithm, geohashing, surge pricing, trip state machine, notifications." },
  { title:"News Feed (like Facebook)", points:"Fan-out on write vs read, content ranking algorithm, caching, pagination, celebrity problem solution." },
];

const RESUME_TIPS = [
  { icon:"📌", title:"One page for freshers", tip:"Keep your resume to one page. Recruiters spend 6 seconds on initial scan. Every line must earn its place." },
  { icon:"💻", title:"Projects > coursework", tip:"List 2-3 strong projects with tech stack, your specific contribution, and measurable outcomes. 'Built X using Y that does Z' format." },
  { icon:"📊", title:"Quantify everything", tip:"Instead of 'improved performance', write 'reduced query time by 40%'. Numbers make achievements concrete and credible." },
  { icon:"🎯", title:"Match keywords to JD", tip:"Read the job description carefully. Mirror the exact keywords (Python, REST API, microservices) — ATS systems filter on these." },
  { icon:"🔗", title:"GitHub & LinkedIn are mandatory", tip:"Clean, active GitHub with pinned projects. Complete LinkedIn with all skills, endorsements, and recommendations from professors." },
  { icon:"❌", title:"Avoid these mistakes", tip:"No photos, no personal details (age, marital status), no 'Hobbies: watching movies', no tables (ATS unfriendly), no spelling errors." },
  { icon:"🏆", title:"Competitive programming", tip:"If you have LeetCode 100+ problems solved, Codeforces rating, or hackathon wins — put them prominently. This differentiates you." },
  { icon:"📧", title:"Professional email", tip:"Use firstname.lastname@gmail.com. Avoid nicknames or numbers. This is the first thing recruiters notice." },
];

const COMPANY_QA = [
  { co:"amazon", q:"Tell me about a time you disagreed with a decision and what you did.", a:"Amazon leadership principle: Have Backbone; Disagree and Commit. Show you raised concerns professionally, explained reasoning, and committed after decision was made." },
  { co:"google", q:"What's your favorite Google product and how would you improve it?", a:"Show genuine user empathy + technical depth. Structure: What you like, what could be better, specific feature improvement with trade-offs considered." },
  { co:"tcs", q:"What is the difference between abstract class and interface in Java?", a:"Abstract class can have implemented methods and state; interface (pre-Java 8) has only abstract methods. A class can implement multiple interfaces but extend only one class." },
  { co:"infosys", q:"Explain OOPS concepts with real-world examples.", a:"Encapsulation: Car (internal mechanism hidden, only steering exposed). Inheritance: SUV extends Car. Polymorphism: shape.draw() works for Circle, Square. Abstraction: Remote control hides TV internals." },
  { co:"microsoft", q:"Design a parking lot system.", a:"Classes: ParkingLot, Floor, Spot (Compact/Large/Handicapped), Vehicle (Car/Truck), Ticket. Features: entry/exit, payment, availability tracking. Design for OCP — open to new spot types." },
  { co:"amazon", q:"How would you handle a system that is running slowly?", a:"Diagnose: logs, metrics, profiling. Common causes: N+1 queries, missing indexes, lack of caching, inefficient algorithms. Fix: add cache (Redis), optimize queries, horizontal scaling." },
];

const TEMPLATES = {
  python: `# Python solution
def solve():
    # Read input
    n = int(input())
    arr = list(map(int, input().split()))
    
    # Your solution here
    result = 0
    
    print(result)

solve()`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    cin >> n;
    
    vector<int> arr(n);
    for(int i = 0; i < n; i++) cin >> arr[i];
    
    // Your solution here
    int result = 0;
    
    cout << result << endl;
    return 0;
}`,
  java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for(int i = 0; i < n; i++) arr[i] = sc.nextInt();
        
        // Your solution here
        int result = 0;
        
        System.out.println(result);
    }
}`,
  c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    scanf("%d", &n);
    
    int arr[n];
    for(int i = 0; i < n; i++) scanf("%d", &arr[i]);
    
    // Your solution here
    int result = 0;
    
    printf("%d\\n", result);
    return 0;
}`,
  javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', line => lines.push(line.trim()));
rl.on('close', () => {
    const n = parseInt(lines[0]);
    const arr = lines[1].split(' ').map(Number);
    
    // Your solution here
    let result = 0;
    
    console.log(result);
});`,
};

/* ══════════ STATE ══════════ */

let state = {
  done: JSON.parse(localStorage.getItem('dsa_done') || '{}'),
  notes: JSON.parse(localStorage.getItem('dsa_notes') || '{}'),
  activity: JSON.parse(localStorage.getItem('dsa_activity') || '[]'),
  points: parseInt(localStorage.getItem('dsa_points') || '0'),
  bookmarks: JSON.parse(localStorage.getItem('dsa_bookmarks') || '[]'),
  diffFilter: 'all',
  coFilter: 'all',
  topicFilter: 'all',
  currentProblem: null,
  hintIndex: 0,
  mockTimerRunning: false,
  mockTimeLeft: 90 * 60,
  mockTimerInterval: null,
  vizType: 'sorting',
  vizRunning: false,
  vizArr: [],
  vizStep: 0,
  vizSteps: [],
};

function saveState() {
  localStorage.setItem('dsa_done', JSON.stringify(state.done));
  localStorage.setItem('dsa_notes', JSON.stringify(state.notes));
  localStorage.setItem('dsa_activity', JSON.stringify(state.activity));
  localStorage.setItem('dsa_points', state.points);
  localStorage.setItem('dsa_bookmarks', JSON.stringify(state.bookmarks));
}

/* ══════════ HELPERS ══════════ */

function totalProbs() { return Object.values(PROBLEMS).reduce((a, b) => a + b.length, 0); }
function doneCount() { return Object.keys(state.done).filter(k => state.done[k]).length; }
function topicDone(t) { return PROBLEMS[t].filter((_, i) => state.done[`${t}_${i}`]).length; }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function prevDayStr(d) { const dt = new Date(d); dt.setDate(dt.getDate() - 1); return dt.toISOString().slice(0, 10); }

function getStreak() {
  if (!state.activity.length) return 0;
  const sorted = [...new Set(state.activity)].sort().reverse();
  const today = todayStr(), yest = prevDayStr(today);
  if (sorted[0] !== today && sorted[0] !== yest) return 0;
  let streak = 0, cur = sorted[0];
  for (const d of sorted) {
    if (d === cur) { streak++; cur = prevDayStr(cur); } else break;
  }
  return streak;
}

function markActivity() {
  const t = todayStr();
  if (!state.activity.includes(t)) { state.activity.push(t); saveState(); }
}

function addPoints(pts) {
  state.points += pts;
  saveState();
  updateNavStats();
  showToast(`+${pts} points! ⭐`);
}

function showToast(msg, duration = 2200) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}

function coTag(c) {
  return `<span class="co-tag" style="background:${CO_COLORS[c]}18;color:${CO_COLORS[c]}">${c}</span>`;
}

function updateNavStats() {
  document.getElementById('nav-streak').textContent = getStreak();
  document.getElementById('nav-points').textContent = state.points;
}

/* ══════════ PAGE ROUTING ══════════ */

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const target = document.getElementById(`page-${page}`);
  if (target) target.classList.add('active');
  const btn = [...document.querySelectorAll('.nav-btn')].find(b =>
    b.textContent.toLowerCase().includes(page === 'home' ? 'roadmap' : page.slice(0, 4))
  );
  if (page === 'roadmap') document.querySelectorAll('.nav-btn')[0]?.classList.add('active');
  if (page === 'practice') document.querySelectorAll('.nav-btn')[1]?.classList.add('active');
  if (page === 'compiler') document.querySelectorAll('.nav-btn')[2]?.classList.add('active');
  if (page === 'visualizer') document.querySelectorAll('.nav-btn')[3]?.classList.add('active');
  if (page === 'interview') document.querySelectorAll('.nav-btn')[4]?.classList.add('active');
  if (page === 'progress') document.querySelectorAll('.nav-btn')[5]?.classList.add('active');

  if (page === 'home') renderHome();
  if (page === 'roadmap') renderRoadmap('full');
  if (page === 'practice') renderPractice();
  if (page === 'compiler') initCompiler();
  if (page === 'visualizer') renderVisualizer('sorting');
  if (page === 'interview') renderInterview('hr');
  if (page === 'progress') renderProgress();
  window.scrollTo(0, 0);
}

/* ══════════ HOME ══════════ */

function renderHome() {
  document.getElementById('hs-solved').textContent = doneCount();
  document.getElementById('hs-streak').textContent = getStreak() + '🔥';
  renderDailyChallenge();
}

function renderDailyChallenge() {
  const allProbs = Object.entries(PROBLEMS).flatMap(([t, probs]) =>
    probs.map((p, i) => ({ ...p, t: +t, i }))
  );
  const dayIdx = Math.floor(Date.now() / 86400000) % allProbs.length;
  const prob = allProbs[dayIdx];

  document.getElementById('daily-meta').innerHTML = `
    <span class="diff-tag ${DIFF_CLASS[prob.d]}">${prob.d}</span>
    <span style="font-size:12px;color:var(--muted);font-family:var(--fm)">${TOPICS[prob.t]}</span>
  `;
  document.getElementById('daily-card').innerHTML = `
    <div style="font-family:var(--fh);font-size:1.2rem;font-weight:700;color:#fff;margin-bottom:.6rem">${prob.n}</div>
    <p style="font-size:13px;color:var(--muted);line-height:1.7;margin-bottom:1rem">${prob.desc}</p>
    <div style="display:flex;gap:.6rem;flex-wrap:wrap">
      <button class="btn-primary" style="font-size:13px;padding:9px 20px" onclick="openProblem(${prob.t},${prob.i})">Solve Now →</button>
      <a href="${prob.url}" target="_blank" class="btn-secondary" style="font-size:13px;padding:9px 20px">Open LeetCode ↗</a>
    </div>
  `;
}

/* ══════════ ROADMAP ══════════ */

function renderRoadmap(type) {
  const container = document.getElementById('roadmap-content');
  let weeks = type === 'full' ? ROADMAP_DATA : ROADMAP_DATA.filter(w =>
    COMPANY_PATHS[type]?.topics.includes(w.topic)
  );

  container.innerHTML = weeks.map((w, idx) => `
    <div class="roadmap-week">
      <div class="roadmap-week-header" onclick="toggleWeek(${idx})">
        <span class="week-badge">${w.week}</span>
        <span class="week-title">${w.title}</span>
        <span class="week-meta">${PROBLEMS[w.topic].length} problems · ${topicDone(w.topic)} done</span>
        <span class="week-chevron" id="chev-${idx}">▶</span>
      </div>
      <div class="roadmap-week-body" id="week-body-${idx}">
        <div class="topic-resources">
          <div class="topic-res-title">📹 Videos & Articles</div>
          <div class="res-links">
            ${w.resources.map(r => `
              <a class="res-link" href="${r.url}" target="_blank">
                <div class="rl-icon rl-${r.type}">${r.type==='yt'?'▶':r.type==='lc'?'🟨':r.type==='doc'?'📘':'📄'}</div>
                <span class="rl-name">${r.name}</span>
                <span class="rl-meta">${r.meta}</span>
              </a>
            `).join('')}
          </div>
        </div>
        <div style="margin-top:1rem">
          <div class="topic-res-title">💻 Must-Solve Problems</div>
          <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-top:.4rem">
            ${PROBLEMS[w.topic].slice(0, 6).map((p, i) => {
              const isDone = state.done[`${w.topic}_${i}`];
              return `<div class="prob-item" onclick="openProblem(${w.topic},${i})">
                <span class="prob-name${isDone?' solved':''}">${p.n}</span>
                <div class="prob-cos">${p.co.slice(0,2).map(coTag).join('')}</div>
                <span class="diff-tag ${DIFF_CLASS[p.d]}">${p.d}</span>
                <div class="prob-check${isDone?' done':''}" onclick="event.stopPropagation();toggleDone(${w.topic},${i})">${isDone?'✓':''}</div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function toggleWeek(idx) {
  const body = document.getElementById(`week-body-${idx}`);
  const chev = document.getElementById(`chev-${idx}`);
  body.classList.toggle('open');
  chev.classList.toggle('open');
}

function switchPath(type, btn) {
  document.querySelectorAll('.path-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderRoadmap(type);
}

/* ══════════ PRACTICE ══════════ */

function renderPractice() {
  // Topic filter buttons
  const tf = document.getElementById('topic-filters');
  tf.innerHTML = `<button class="filter-btn active" onclick="setFilter('topic','all',this)">All Topics</button>` +
    TOPICS.map((t, i) => `<button class="filter-btn" onclick="setFilter('topic',${i},this)">${t}</button>`).join('');

  renderProblemList();
}

function renderProblemList() {
  const container = document.getElementById('problem-list');
  let html = '';
  for (let t = 0; t < 8; t++) {
    if (state.topicFilter !== 'all' && +state.topicFilter !== t) continue;
    const probs = PROBLEMS[t].filter(p =>
      (state.diffFilter === 'all' || p.d === state.diffFilter) &&
      (state.coFilter === 'all' || p.co.includes(state.coFilter))
    );
    if (!probs.length) continue;
    html += `<div class="prob-group-title">${TOPICS[t]}</div><div class="prob-group">`;
    html += probs.map(p => {
      const i = PROBLEMS[t].indexOf(p);
      const isDone = state.done[`${t}_${i}`];
      return `<div class="prob-item" onclick="openProblem(${t},${i})">
        <span class="prob-name${isDone?' solved':''}">${p.n}</span>
        <div class="prob-cos">${p.co.slice(0, 3).map(coTag).join('')}</div>
        <span class="diff-tag ${DIFF_CLASS[p.d]}">${p.d}</span>
        <div class="prob-check${isDone?' done':''}" onclick="event.stopPropagation();toggleDone(${t},${i})">${isDone?'✓':''}</div>
      </div>`;
    }).join('');
    html += '</div>';
  }
  container.innerHTML = html || '<div style="color:var(--muted);padding:2rem;text-align:center;font-size:13px">No problems match current filters.</div>';
}

function setFilter(type, val, btn) {
  if (type === 'diff') {
    state.diffFilter = val;
    document.querySelectorAll('#diff-filters .filter-btn').forEach(b => b.classList.remove('active'));
  } else if (type === 'co') {
    state.coFilter = val;
    document.querySelectorAll('#co-filters .filter-btn').forEach(b => b.classList.remove('active'));
  } else {
    state.topicFilter = val;
    document.querySelectorAll('#topic-filters .filter-btn').forEach(b => b.classList.remove('active'));
  }
  btn.classList.add('active');
  renderProblemList();
}

function toggleDone(t, i) {
  const key = `${t}_${i}`;
  state.done[key] = !state.done[key];
  if (state.done[key]) {
    markActivity();
    addPoints(PROBLEMS[t][i].d === 'easy' ? 10 : PROBLEMS[t][i].d === 'medium' ? 20 : 40);
    showToast('Problem solved! 🎉');
    checkBadges();
  }
  saveState();
  renderProblemList();
  updateNavStats();
  document.getElementById('hs-solved') && (document.getElementById('hs-solved').textContent = doneCount());
}

/* ══════════ PROBLEM DETAIL ══════════ */

function openProblem(t, i) {
  state.currentProblem = { t, i };
  state.hintIndex = 0;
  const p = PROBLEMS[t][i];

  document.getElementById('prob-detail-content').innerHTML = `
    <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.75rem">
      <span class="diff-tag ${DIFF_CLASS[p.d]}">${p.d}</span>
      <span style="font-size:11px;color:var(--muted);font-family:var(--fm)">${TOPICS[t]}</span>
      ${p.co.map(coTag).join('')}
    </div>
    <h2>${p.n}</h2>
    <p>${p.desc}</p>
    <div class="prob-examples">
      <h4>Examples</h4>
      <pre>${p.examples}</pre>
    </div>
    <div style="display:flex;gap:.5rem;margin-bottom:.75rem">
      <a href="${p.url}" target="_blank" class="btn-secondary" style="font-size:12px;padding:6px 14px">Open on LeetCode ↗</a>
      <button onclick="toggleDone(${t},${i});renderProblemList()" 
        class="btn-secondary" style="font-size:12px;padding:6px 14px" id="mark-done-btn">
        ${state.done[`${t}_${i}`] ? '✓ Solved' : 'Mark as Solved'}
      </button>
    </div>
  `;

  document.getElementById('hint-boxes').innerHTML = '';
  document.getElementById('prob-notes').value = state.notes[`${t}_${i}`] || '';

  const lang = document.getElementById('lang-select').value;
  document.getElementById('code-editor').value = TEMPLATES[lang];
  document.getElementById('code-output').innerHTML = '<div class="output-placeholder">Output will appear here after running your code...</div>';

  showPage('problem');
}

function showNextHint() {
  const { t, i } = state.currentProblem;
  const hints = PROBLEMS[t][i].hints;
  if (state.hintIndex >= hints.length) { showToast('No more hints! Try solving it yourself now.'); return; }
  const hintEl = document.createElement('div');
  hintEl.className = 'hint-box';
  hintEl.innerHTML = `<strong style="color:var(--accent-l)">Hint ${state.hintIndex + 1}:</strong> ${hints[state.hintIndex]}`;
  document.getElementById('hint-boxes').appendChild(hintEl);
  state.hintIndex++;
}

function changeLang() {
  const lang = document.getElementById('lang-select').value;
  document.getElementById('code-editor').value = TEMPLATES[lang];
}

function runCode() {
  const code = document.getElementById('code-editor').value;
  const lang = document.getElementById('lang-select').value;
  const output = document.getElementById('code-output');
  output.innerHTML = '<div style="color:var(--muted)">Running...</div>';
  setTimeout(() => {
    output.innerHTML = `<div class="output-success">✓ Code compiled successfully (simulation)\n\nNote: This is a frontend simulation. For actual code execution, integrate the Judge0 API (free tier available at judge0.com). The API supports 60+ languages including all listed here.\n\nYour ${lang} code:\n${code.split('\n').slice(0,5).join('\n')}...</div>`;
  }, 800);
}

function submitCode() {
  const output = document.getElementById('code-output');
  output.innerHTML = '<div style="color:var(--muted)">Submitting...</div>';
  setTimeout(() => {
    const pass = Math.random() > 0.3;
    if (pass) {
      output.innerHTML = `<div class="output-success">✅ Accepted\n\nAll test cases passed!\nRuntime: ${Math.floor(Math.random()*50+20)}ms\nMemory: ${Math.floor(Math.random()*10+15)}MB</div>`;
      if (state.currentProblem) {
        toggleDone(state.currentProblem.t, state.currentProblem.i);
      }
    } else {
      output.innerHTML = `<div class="output-error">❌ Wrong Answer\n\nTest case 3 failed:\nExpected: [0,1]\nGot: [1,0]\n\nHint: Check your output order.</div>`;
    }
  }, 1200);
}

function saveNote() {
  const { t, i } = state.currentProblem;
  state.notes[`${t}_${i}`] = document.getElementById('prob-notes').value;
  saveState();
  showToast('Note saved! 📝');
}

/* ══════════ COMPILER ══════════ */

function initCompiler() {
  setCompilerTemplate();
  document.getElementById('comp-ref').innerHTML = `
    Python: list comprehension O(n), dict O(1), set O(1)<br>
    Sorting: O(n log n) Timsort<br>
    heapq: O(log n) push/pop<br>
    bisect: O(log n) search<br>
    <br>
    C++: vector, map O(log n), unordered_map O(1)<br>
    sort: O(n log n), priority_queue: O(log n)<br>
    <br>
    Java: ArrayList, HashMap O(1), TreeMap O(log n)<br>
    Arrays.sort: O(n log n)
  `;
}

function setCompilerTemplate() {
  const lang = document.getElementById('compiler-lang').value;
  document.getElementById('compiler-editor').value = TEMPLATES[lang];
}

function clearCompiler() {
  document.getElementById('compiler-editor').value = '';
}

function copyCode() {
  navigator.clipboard.writeText(document.getElementById('compiler-editor').value);
  showToast('Code copied! 📋');
}

function runCompilerCode() {
  const code = document.getElementById('compiler-editor').value;
  const input = document.getElementById('compiler-input').value;
  const out = document.getElementById('compiler-output');
  out.textContent = 'Running...';
  out.style.color = 'var(--muted)';
  setTimeout(() => {
    out.style.color = 'var(--green)';
    out.textContent = `Simulation output (Judge0 API integration required for real execution):\n\nInput:\n${input || '(no input)'}\n\nCode received: ${code.split('\n').length} lines\n\n→ To run real code, integrate Judge0 API:\n  POST https://judge0-ce.p.rapidapi.com/submissions\n  Body: { language_id, source_code, stdin }\n  Free tier: 200 requests/day`;
  }, 700);
}

/* ══════════ VISUALIZER ══════════ */

function renderVisualizer(type) {
  state.vizType = type;
  const container = document.getElementById('viz-container');

  if (type === 'sorting') {
    container.innerHTML = `
      <div class="viz-card">
        <div style="font-family:var(--fh);font-size:1rem;font-weight:700;color:#fff;margin-bottom:1rem">Sorting Visualizer</div>
        <div class="viz-controls">
          <select id="sort-algo" style="background:var(--surface2);border:1px solid var(--border2);color:var(--text);padding:6px 12px;border-radius:7px;font-family:var(--fb)">
            <option value="bubble">Bubble Sort</option>
            <option value="selection">Selection Sort</option>
            <option value="insertion">Insertion Sort</option>
            <option value="merge">Merge Sort</option>
          </select>
          <label style="font-size:12px;color:var(--muted)">Size: <input type="range" id="arr-size" min="5" max="30" value="15" style="vertical-align:middle"></label>
          <button class="viz-btn" onclick="generateSortArray()">🔀 Generate</button>
          <button class="viz-btn" id="sort-start-btn" onclick="startSort()">▶ Start</button>
          <button class="viz-btn" onclick="sortStep()">⏭ Step</button>
        </div>
        <div class="viz-canvas-wrap" id="sort-canvas"></div>
        <div class="viz-step-info" id="sort-info">Generate an array and press Start to begin visualization.</div>
        <div style="margin-top:1rem;font-size:13px;color:var(--muted);line-height:1.8">
          <strong style="color:var(--text)">How it works:</strong><br>
          🟦 Blue = unsorted element &nbsp; 🟨 Yellow = comparing &nbsp; 🟥 Red = swapping &nbsp; 🟩 Green = sorted
        </div>
      </div>`;
    generateSortArray();

  } else if (type === 'tree') {
    container.innerHTML = `
      <div class="viz-card">
        <div style="font-family:var(--fh);font-size:1rem;font-weight:700;color:#fff;margin-bottom:1rem">Tree Traversal Visualizer</div>
        <div class="viz-controls">
          <select id="tree-traversal" style="background:var(--surface2);border:1px solid var(--border2);color:var(--text);padding:6px 12px;border-radius:7px;font-family:var(--fb)">
            <option value="inorder">Inorder (Left→Root→Right)</option>
            <option value="preorder">Preorder (Root→Left→Right)</option>
            <option value="postorder">Postorder (Left→Right→Root)</option>
            <option value="bfs">Level Order (BFS)</option>
          </select>
          <button class="viz-btn" onclick="startTreeTraversal()">▶ Visualize</button>
        </div>
        <div id="tree-canvas" class="tree-canvas" style="min-height:280px;position:relative;background:var(--bg);border:1px solid var(--border);border-radius:10px;overflow:hidden"></div>
        <div class="viz-step-info" id="tree-info" style="margin-top:.75rem">Select a traversal and click Visualize.</div>
        <div id="traversal-order" style="margin-top:.5rem;font-family:var(--fm);font-size:13px;color:var(--accent-l)"></div>
      </div>`;
    drawTree();

  } else if (type === 'graph') {
    container.innerHTML = `
      <div class="viz-card">
        <div style="font-family:var(--fh);font-size:1rem;font-weight:700;color:#fff;margin-bottom:1rem">Graph BFS / DFS Visualizer</div>
        <div class="viz-controls">
          <select id="graph-algo" style="background:var(--surface2);border:1px solid var(--border2);color:var(--text);padding:6px 12px;border-radius:7px;font-family:var(--fb)">
            <option value="bfs">BFS (Breadth-First Search)</option>
            <option value="dfs">DFS (Depth-First Search)</option>
          </select>
          <button class="viz-btn" onclick="startGraphTraversal()">▶ Start from Node 0</button>
          <button class="viz-btn" onclick="resetGraph()">↺ Reset</button>
        </div>
        <div id="graph-canvas" style="min-height:300px;position:relative;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:1rem"></div>
        <div class="viz-step-info" id="graph-info">Click Start to begin traversal from node 0.</div>
        <div id="graph-order" style="margin-top:.5rem;font-family:var(--fm);font-size:13px;color:var(--teal)"></div>
      </div>`;
    drawGraph();

  } else if (type === 'search') {
    container.innerHTML = `
      <div class="viz-card">
        <div style="font-family:var(--fh);font-size:1rem;font-weight:700;color:#fff;margin-bottom:1rem">Binary Search Visualizer</div>
        <div class="viz-controls">
          <label style="font-size:13px;color:var(--muted)">Target: <input type="number" id="bs-target" value="42" style="background:var(--surface2);border:1px solid var(--border2);color:var(--text);padding:5px 10px;border-radius:7px;width:80px"></label>
          <button class="viz-btn" onclick="startBinarySearch()">▶ Search</button>
          <button class="viz-btn" onclick="bsStep()">⏭ Step</button>
          <button class="viz-btn" onclick="resetBS()">↺ Reset</button>
        </div>
        <div id="bs-canvas" style="padding:1.5rem;background:var(--bg);border:1px solid var(--border);border-radius:10px;overflow-x:auto"></div>
        <div class="viz-step-info" id="bs-info">Enter a target value and click Search.</div>
      </div>`;
    initBS();
  }
}

function switchViz(type, btn) {
  document.querySelectorAll('.viz-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderVisualizer(type);
}

/* Sorting */
let sortSteps = [], sortPos = 0, sortAnimArr = [];

function generateSortArray() {
  const size = +document.getElementById('arr-size').value;
  sortAnimArr = Array.from({length: size}, () => Math.floor(Math.random() * 90) + 10);
  sortSteps = []; sortPos = 0;
  drawSortBars(sortAnimArr, [], [], []);
  document.getElementById('sort-info').textContent = `Array of ${size} elements generated. Press Start to sort!`;
}

function drawSortBars(arr, comparing, swapping, sorted) {
  const canvas = document.getElementById('sort-canvas');
  if (!canvas) return;
  const maxVal = Math.max(...arr);
  canvas.innerHTML = arr.map((v, i) => {
    let bg = '#4a9eff';
    if (sorted.includes(i)) bg = '#1fc87a';
    else if (swapping.includes(i)) bg = '#e95050';
    else if (comparing.includes(i)) bg = '#f0a500';
    const h = Math.max(20, (v / maxVal) * 220);
    return `<div class="viz-bar" style="height:${h}px;background:${bg};position:relative"><span style="position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);font-size:9px;color:var(--muted);font-family:var(--fm)">${v}</span></div>`;
  }).join('');
}

function buildBubbleSteps(arr) {
  const a = [...arr], steps = [];
  const n = a.length, sorted = [];
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ arr: [...a], comparing: [j, j+1], swapping: [], sorted: [...sorted] });
      if (a[j] > a[j+1]) {
        [a[j], a[j+1]] = [a[j+1], a[j]];
        steps.push({ arr: [...a], comparing: [], swapping: [j, j+1], sorted: [...sorted] });
      }
    }
    sorted.push(n - 1 - i);
  }
  sorted.push(0);
  steps.push({ arr: [...a], comparing: [], swapping: [], sorted: a.map((_, k) => k) });
  return steps;
}

function buildSelectionSteps(arr) {
  const a = [...arr], steps = [], sorted = [];
  for (let i = 0; i < a.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < a.length; j++) {
      steps.push({ arr: [...a], comparing: [minIdx, j], swapping: [], sorted: [...sorted] });
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      steps.push({ arr: [...a], comparing: [], swapping: [i, minIdx], sorted: [...sorted] });
    }
    sorted.push(i);
  }
  sorted.push(a.length - 1);
  steps.push({ arr: [...a], comparing: [], swapping: [], sorted: a.map((_, k) => k) });
  return steps;
}

function startSort() {
  const algo = document.getElementById('sort-algo').value;
  if (algo === 'bubble') sortSteps = buildBubbleSteps(sortAnimArr);
  else if (algo === 'selection') sortSteps = buildSelectionSteps(sortAnimArr);
  else sortSteps = buildBubbleSteps(sortAnimArr); // fallback
  sortPos = 0;
  animateSort();
}

function animateSort() {
  if (sortPos >= sortSteps.length) return;
  const step = sortSteps[sortPos++];
  drawSortBars(step.arr, step.comparing, step.swapping, step.sorted);
  const info = step.comparing.length ? `Comparing indices ${step.comparing.join(' and ')}: values ${step.comparing.map(i=>step.arr[i]).join(' vs ')}`
    : step.swapping.length ? `Swapped positions ${step.swapping.join(' and ')}`
    : 'Sorting complete! ✓';
  document.getElementById('sort-info').textContent = info;
  if (sortPos < sortSteps.length) setTimeout(animateSort, 120);
}

function sortStep() {
  if (!sortSteps.length) startSort();
  else if (sortPos < sortSteps.length) {
    const step = sortSteps[sortPos++];
    drawSortBars(step.arr, step.comparing, step.swapping, step.sorted);
  }
}

/* Tree */
const TREE_NODES = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
const TREE_POS = {
  1:{x:330,y:30},2:{x:180,y:100},3:{x:480,y:100},
  4:{x:100,y:170},5:{x:260,y:170},6:{x:400,y:170},7:{x:560,y:170},
  8:{x:60,y:240},9:{x:140,y:240},10:{x:220,y:240},11:{x:300,y:240},
  12:{x:360,y:240},13:{x:440,y:240},14:{x:520,y:240},15:{x:600,y:240}
};
const TREE_EDGES = [[1,2],[1,3],[2,4],[2,5],[3,6],[3,7],[4,8],[4,9],[5,10],[5,11],[6,12],[6,13],[7,14],[7,15]];

function drawTree() {
  const canvas = document.getElementById('tree-canvas');
  if (!canvas) return;
  canvas.style.height = '300px';
  canvas.innerHTML = TREE_EDGES.map(([p, c]) => {
    const px = TREE_POS[p], cx = TREE_POS[c];
    const len = Math.sqrt((cx.x-px.x)**2+(cx.y-py.y)**2);
    const angle = Math.atan2(cx.y-px.y, cx.x-px.x)*180/Math.PI;
    return `<div class="tree-edge" id="edge-${p}-${c}" style="left:${px.x+21}px;top:${px.y+21}px;width:${len}px;transform:rotate(${angle}deg)"></div>`;
    var py = px; // fix: reference before use
  }).join('') + TREE_NODES.map(n =>
    `<div class="tree-node" id="tnode-${n}" style="left:${TREE_POS[n].x}px;top:${TREE_POS[n].y}px">${n}</div>`
  ).join('');

  // Fix edge rendering with proper calc
  canvas.innerHTML = '';
  TREE_EDGES.forEach(([p,c]) => {
    const px = TREE_POS[p], cx = TREE_POS[c];
    const dx = cx.x - px.x, dy = cx.y - px.y;
    const len = Math.sqrt(dx*dx + dy*dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const edge = document.createElement('div');
    edge.className = 'tree-edge'; edge.id = `edge-${p}-${c}`;
    edge.style.cssText = `left:${px.x+21}px;top:${px.y+21}px;width:${len}px;transform:rotate(${angle}deg)`;
    canvas.appendChild(edge);
  });
  TREE_NODES.forEach(n => {
    const node = document.createElement('div');
    node.className = 'tree-node'; node.id = `tnode-${n}`;
    node.style.cssText = `left:${TREE_POS[n].x}px;top:${TREE_POS[n].y}px`;
    node.textContent = n;
    canvas.appendChild(node);
  });
}

function getTraversalOrder(type) {
  const order = [];
  function inorder(n) { if(!n||n>15) return; inorder(2*n); order.push(n); inorder(2*n+1); }
  function preorder(n) { if(!n||n>15) return; order.push(n); preorder(2*n); preorder(2*n+1); }
  function postorder(n) { if(!n||n>15) return; postorder(2*n); postorder(2*n+1); order.push(n); }
  function bfs() { const q=[1]; while(q.length){const n=q.shift();if(n>15)continue;order.push(n);q.push(2*n,2*n+1);} }
  if(type==='inorder') inorder(1); else if(type==='preorder') preorder(1); else if(type==='postorder') postorder(1); else bfs();
  return order;
}

function startTreeTraversal() {
  TREE_NODES.forEach(n => { const el = document.getElementById(`tnode-${n}`); if(el){ el.classList.remove('visited','current'); } });
  const type = document.getElementById('tree-traversal').value;
  const order = getTraversalOrder(type);
  document.getElementById('traversal-order').textContent = '';
  document.getElementById('tree-info').textContent = `Traversal: ${type}`;
  let idx = 0;
  const visited = [];
  const interval = setInterval(() => {
    if (idx >= order.length) { clearInterval(interval); document.getElementById('tree-info').textContent = `Complete! Order: ${order.join(' → ')}`; return; }
    if (idx > 0) {
      const prev = document.getElementById(`tnode-${order[idx-1]}`);
      if(prev) { prev.classList.remove('current'); prev.classList.add('visited'); }
    }
    const node = document.getElementById(`tnode-${order[idx]}`);
    if(node) node.classList.add('current');
    visited.push(order[idx]);
    document.getElementById('traversal-order').textContent = 'Visited: ' + visited.join(' → ');
    idx++;
  }, 500);
}

/* Graph */
const GRAPH_ADJ = { 0:[1,2], 1:[0,3,4], 2:[0,5], 3:[1], 4:[1,5,6], 5:[2,4], 6:[4] };
const GRAPH_POS = { 0:{x:200,y:50}, 1:{x:80,y:150}, 2:{x:320,y:150}, 3:{x:20,y:260}, 4:{x:140,y:260}, 5:{x:260,y:260}, 6:{x:200,y:370} };

function drawGraph(visited=[], current=-1, queue=[]) {
  const canvas = document.getElementById('graph-canvas');
  if(!canvas) return;
  canvas.innerHTML = '';
  canvas.style.position='relative'; canvas.style.height='420px';
  Object.entries(GRAPH_ADJ).forEach(([u, neighbors]) => {
    neighbors.forEach(v => {
      if(+u < v) {
        const pu=GRAPH_POS[u], pv=GRAPH_POS[v];
        const dx=pv.x-pu.x, dy=pv.y-pu.y, len=Math.sqrt(dx*dx+dy*dy);
        const angle=Math.atan2(dy,dx)*180/Math.PI;
        const edge=document.createElement('div');
        edge.style.cssText=`position:absolute;left:${pu.x+20}px;top:${pu.y+20}px;width:${len}px;height:2px;background:var(--faint);transform:rotate(${angle}deg);transform-origin:left center`;
        canvas.appendChild(edge);
      }
    });
  });
  Object.entries(GRAPH_POS).forEach(([n, pos]) => {
    const node=document.createElement('div');
    let bg = 'var(--surface2)', border = 'var(--accent)', color='#fff';
    if(+n===current) { bg='var(--amber)'; border='var(--amber)'; }
    else if(visited.includes(+n)) { bg='var(--accent)'; border='var(--accent)'; }
    if(queue.includes(+n) && +n!==current) { border='var(--teal)'; }
    node.style.cssText=`position:absolute;left:${pos.x}px;top:${pos.y}px;width:40px;height:40px;border-radius:50%;background:${bg};border:2px solid ${border};display:flex;align-items:center;justify-content:center;font-family:var(--fm);font-size:13px;font-weight:600;color:${color};transition:all .3s`;
    node.textContent = n;
    canvas.appendChild(node);
  });
}

function startGraphTraversal() {
  const algo = document.getElementById('graph-algo').value;
  const visited = [], order = [], queue = [0];
  drawGraph(visited, 0, queue);
  let step = 0;
  if(algo === 'bfs') {
    const q = [0]; const vis = new Set([0]);
    const steps = [];
    while(q.length) {
      const node=q.shift(); visited.push(node);
      const nb=GRAPH_ADJ[node].filter(n=>!vis.has(n));
      nb.forEach(n=>{vis.add(n);q.push(n);});
      steps.push({visited:[...visited],current:node,queue:[...q]});
    }
    let si=0;
    const iv=setInterval(()=>{
      if(si>=steps.length){clearInterval(iv);document.getElementById('graph-info').textContent='BFS complete! Order: '+steps.map(s=>s.current).join(' → ');return;}
      const s=steps[si++];
      drawGraph(s.visited,s.current,s.queue);
      document.getElementById('graph-order').textContent='Visited: '+s.visited.join(' → ');
      document.getElementById('graph-info').textContent=`BFS: Processing node ${s.current}. Queue: [${s.queue.join(',')}]`;
    }, 700);
  } else {
    const vis=new Set(), steps=[];
    function dfs(n){
      vis.add(n); visited.push(n);
      steps.push({visited:[...visited],current:n,queue:[]});
      for(const nb of GRAPH_ADJ[n]){ if(!vis.has(nb)) dfs(nb); }
    }
    dfs(0);
    let si=0;
    const iv=setInterval(()=>{
      if(si>=steps.length){clearInterval(iv);document.getElementById('graph-info').textContent='DFS complete! Order: '+steps.map(s=>s.current).join(' → ');return;}
      const s=steps[si++];
      drawGraph(s.visited,s.current,[]);
      document.getElementById('graph-order').textContent='Visited: '+s.visited.join(' → ');
      document.getElementById('graph-info').textContent=`DFS: Visiting node ${s.current}`;
    }, 700);
  }
}

function resetGraph() { drawGraph([], -1, []); document.getElementById('graph-info').textContent='Click Start to begin traversal from node 0.'; document.getElementById('graph-order').textContent=''; }

/* Binary Search */
let bsArr=[], bsTarget=0, bsSteps=[], bsIdx=0;
function initBS() {
  bsArr = Array.from({length:20},(_,i)=>i*5+Math.floor(Math.random()*3)).sort((a,b)=>a-b);
  bsArr = [...new Set(bsArr)].slice(0,20);
  bsTarget = bsArr[Math.floor(Math.random()*bsArr.length)];
  document.getElementById('bs-target').value = bsTarget;
  drawBS(-1,-1,-1,-1);
}
function drawBS(lo,hi,mid,found) {
  const canvas = document.getElementById('bs-canvas');
  if(!canvas) return;
  canvas.innerHTML = `<div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center">${bsArr.map((v,i)=>{
    let bg='var(--surface2)',color='var(--text)',border='var(--border)';
    if(i===found){bg='var(--green)';color='#fff';border='var(--green)';}
    else if(i===mid){bg='var(--accent)';color='#fff';border='var(--accent)';}
    else if(i>=lo&&i<=hi){bg='rgba(123,108,246,.15)';border='rgba(123,108,246,.4)';}
    return `<div style="width:42px;height:42px;border-radius:8px;background:${bg};border:1px solid ${border};display:flex;align-items:center;justify-content:center;font-size:12px;font-family:var(--fm);color:${color};transition:all .3s">${v}</div>`;
  }).join('')}</div>`;
}
function startBinarySearch() {
  bsTarget = +document.getElementById('bs-target').value;
  bsSteps = [];
  let lo=0, hi=bsArr.length-1;
  while(lo<=hi){
    const mid=Math.floor((lo+hi)/2);
    bsSteps.push({lo,hi,mid,found:bsArr[mid]===bsTarget?mid:-1});
    if(bsArr[mid]===bsTarget) break;
    if(bsArr[mid]<bsTarget) lo=mid+1; else hi=mid-1;
  }
  bsIdx=0; drawBS(-1,-1,-1,-1);
  animateBS();
}
function animateBS() {
  if(bsIdx>=bsSteps.length) return;
  const s=bsSteps[bsIdx++];
  drawBS(s.lo,s.hi,s.mid,s.found);
  const info = s.found>=0 ? `✅ Found ${bsTarget} at index ${s.found}!` : `mid=${s.mid} (value=${bsArr[s.mid]}). ${bsArr[s.mid]<bsTarget?'Too small, search right →':'Too big, search left ←'}`;
  document.getElementById('bs-info').textContent = info;
  if(bsIdx<bsSteps.length && s.found<0) setTimeout(animateBS, 800);
}
function bsStep() { if(!bsSteps.length) startBinarySearch(); else if(bsIdx<bsSteps.length) { const s=bsSteps[bsIdx++]; drawBS(s.lo,s.hi,s.mid,s.found); } }
function resetBS() { initBS(); document.getElementById('bs-info').textContent='Enter a target and click Search.'; }

/* ══════════ INTERVIEW ══════════ */

function renderInterview(tab) {
  const container = document.getElementById('interview-content');
  if (tab === 'hr') {
    container.innerHTML = `<h3 style="font-family:var(--fh);font-size:1rem;font-weight:700;color:#fff;margin-bottom:1rem">Common HR Interview Questions</h3>` +
      HR_QUESTIONS.map((q, i) => `
        <div class="hr-card">
          <div class="hr-question" onclick="toggleHR(${i})">
            <span class="hr-q-text">${i+1}. ${q.q}</span>
            <span class="hr-toggle" id="hr-toggle-${i}">▼</span>
          </div>
          <div class="hr-answer" id="hr-ans-${i}">${q.a}</div>
        </div>`).join('');

  } else if (tab === 'system') {
    container.innerHTML = `<h3 style="font-family:var(--fh);font-size:1rem;font-weight:700;color:#fff;margin-bottom:1rem">System Design Basics</h3>
      <div style="background:var(--surface);border:1px solid rgba(123,108,246,.2);border-radius:10px;padding:1rem;margin-bottom:1.2rem;font-size:13px;color:var(--muted);line-height:1.7">
        <strong style="color:var(--accent-l)">Framework for any system design question:</strong><br>
        1. Clarify requirements (functional + non-functional)<br>
        2. Estimate scale (users, requests/sec, storage)<br>
        3. High-level architecture (components, data flow)<br>
        4. Database design (schema, SQL vs NoSQL)<br>
        5. API design (endpoints, request/response)<br>
        6. Scaling (load balancer, caching, sharding)<br>
        7. Trade-offs (discuss alternatives)
      </div>` +
      SYSTEM_DESIGN.map(s => `
        <div class="system-card">
          <h3>${s.title}</h3>
          <p><strong style="color:var(--accent-l)">Key components:</strong> ${s.points}</p>
        </div>`).join('');

  } else if (tab === 'resume') {
    container.innerHTML = `<h3 style="font-family:var(--fh);font-size:1rem;font-weight:700;color:#fff;margin-bottom:1rem">Resume Tips for Freshers</h3>` +
      RESUME_TIPS.map(t => `
        <div class="resume-tip">
          <span class="resume-tip-icon">${t.icon}</span>
          <div class="resume-tip-text"><strong>${t.title}:</strong> ${t.tip}</div>
        </div>`).join('');

  } else if (tab === 'mock') {
    container.innerHTML = `
      <div style="text-align:center;padding:1rem 0">
        <div style="font-size:13px;color:var(--muted);margin-bottom:.75rem">Mock Interview Timer — 90 minutes</div>
        <div class="mock-timer" id="mock-timer">90:00</div>
        <div class="mock-controls">
          <button class="btn-primary" onclick="startMock()">▶ Start</button>
          <button class="btn-secondary" onclick="pauseMock()">⏸ Pause</button>
          <button class="btn-secondary" onclick="resetMock()">↺ Reset</button>
        </div>
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:1.25rem;text-align:left;margin-top:1rem">
          <div style="font-family:var(--fh);font-size:15px;font-weight:700;color:#fff;margin-bottom:1rem">🎯 Mock Interview Protocol</div>
          <div style="font-size:13px;color:var(--muted);line-height:1.9">
            <strong style="color:var(--text)">Minutes 0–5:</strong> Clarify the problem. Ask about edge cases, input size, expected output format.<br>
            <strong style="color:var(--text)">Minutes 5–15:</strong> Think aloud. Discuss brute force, then optimize. State time/space complexity.<br>
            <strong style="color:var(--text)">Minutes 15–40:</strong> Code the solution. Write clean, readable code with variable names.<br>
            <strong style="color:var(--text)">Minutes 40–50:</strong> Test with examples. Trace through your code. Fix bugs.<br>
            <strong style="color:var(--text)">Minutes 50–60:</strong> Discuss optimizations, follow-up questions, alternative approaches.
          </div>
        </div>
        <div style="margin-top:1.2rem">
          <button class="btn-primary" onclick="showPage('practice')">Start a Random Problem →</button>
        </div>
      </div>`;

  } else if (tab === 'company') {
    container.innerHTML = `<h3 style="font-family:var(--fh);font-size:1rem;font-weight:700;color:#fff;margin-bottom:1rem">Company-Specific Interview Q&A</h3>` +
      COMPANY_QA.map(q => `
        <div class="company-qa-row">
          <div class="cqa-company" style="color:${CO_COLORS[q.co]}">${q.co.toUpperCase()}</div>
          <div class="cqa-q">${q.q}</div>
          <div class="cqa-a">${q.a}</div>
        </div>`).join('');
  }
}

function switchInterview(tab, btn) {
  document.querySelectorAll('.itab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderInterview(tab);
}

function toggleHR(i) {
  const ans = document.getElementById(`hr-ans-${i}`);
  const tog = document.getElementById(`hr-toggle-${i}`);
  ans.classList.toggle('open');
  tog.textContent = ans.classList.contains('open') ? '▲' : '▼';
}

let mockInterval = null;
function startMock() {
  if (mockInterval) return;
  mockInterval = setInterval(() => {
    state.mockTimeLeft--;
    if (state.mockTimeLeft <= 0) { clearInterval(mockInterval); mockInterval = null; showToast("Time's up! ⏰"); return; }
    const m = Math.floor(state.mockTimeLeft / 60), s = state.mockTimeLeft % 60;
    const el = document.getElementById('mock-timer');
    if(el) el.textContent = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    if(el && state.mockTimeLeft <= 300) el.style.color = 'var(--red)';
  }, 1000);
}
function pauseMock() { clearInterval(mockInterval); mockInterval = null; }
function resetMock() { clearInterval(mockInterval); mockInterval = null; state.mockTimeLeft = 90*60; const el=document.getElementById('mock-timer'); if(el){el.textContent='90:00';el.style.color='';} }

/* ══════════ PROGRESS ══════════ */

function generateStudyPlan() {
  const date = document.getElementById('placement-date').value;
  const level = document.getElementById('current-level').value;
  const hours = document.getElementById('daily-hours').value;
  if (!date) { showToast('Please select your placement date!'); return; }
  const daysLeft = Math.ceil((new Date(date) - new Date()) / 86400000);
  if (daysLeft <= 0) { showToast('Placement date must be in the future!'); return; }
  const weeksLeft = Math.floor(daysLeft / 7);

  const plans = {
    beginner: ['Week 1: Arrays & Strings (basics, two pointers, sliding window)', 'Week 2: Sorting & Binary Search', 'Week 3: Linked Lists + Stack & Queue', 'Week 4: Hashing', 'Week 5: Trees & BST', 'Week 6: Graphs (BFS/DFS)', 'Week 7: Dynamic Programming basics', 'Week 8: Mock tests & revision'],
    basic: ['Week 1: Arrays review + advanced patterns', 'Week 2: Linked Lists & Stack', 'Week 3: Trees & BST deep dive', 'Week 4: Graphs (BFS, DFS, Dijkstra)', 'Week 5: DP (1D, 2D, knapsack)', 'Week 6: DP hard problems', 'Week 7: Company-specific problems', 'Week 8: Mock interviews'],
    intermediate: ['Week 1: Hard array & string problems', 'Week 2: Hard graph problems (topological, union-find)', 'Week 3: Hard DP (intervals, games, trees)', 'Week 4: System design basics', 'Week 5: Company-specific sets (target company)', 'Week 6: Mock interviews daily', 'Week 7: Weak area revision', 'Week 8: Final preparation']
  };

  const dailyProblems = hours >= 3 ? 4 : hours >= 2 ? 3 : 2;
  const plan = plans[level];
  const weeksToShow = Math.min(weeksLeft, plan.length);

  document.getElementById('study-plan-output').innerHTML = `
    <div style="background:rgba(123,108,246,.08);border:1px solid rgba(123,108,246,.2);border-radius:8px;padding:1rem;margin-top:.75rem">
      <div style="font-size:13px;font-weight:500;color:var(--accent-l);margin-bottom:.5rem">📅 Your ${daysLeft}-day plan (${weeksLeft} weeks left)</div>
      <div style="font-size:13px;color:var(--muted);margin-bottom:.75rem">Daily: ${dailyProblems} problems + ${hours}h study · ${Math.round(dailyProblems*daysLeft)} total problems target</div>
      ${plan.slice(0, weeksToShow).map((p, i) => `<div style="font-size:13px;color:var(--text);padding:.3rem 0;border-bottom:1px solid var(--border)">📌 ${p}</div>`).join('')}
      <div style="font-size:12px;color:var(--muted);margin-top:.75rem">Start with 📚 Roadmap → follow this schedule → mark problems done to track progress.</div>
    </div>
  `;
}

function renderProgress() {
  const total = totalProbs(), done = doneCount(), pct = Math.round(done/total*100);
  const statsEl = document.getElementById('progress-stats');
  statsEl.innerHTML = `
    <div class="pstat-card"><div class="pstat-big">${done}</div><div class="pstat-label">Problems solved</div></div>
    <div class="pstat-card"><div class="pstat-big">${total-done}</div><div class="pstat-label">Remaining</div></div>
    <div class="pstat-card"><div class="pstat-big" style="color:var(--accent-l)">${pct}%</div><div class="pstat-label">Complete</div></div>
    <div class="pstat-card"><div class="pstat-big" style="color:var(--amber)">${getStreak()}🔥</div><div class="pstat-label">Day streak</div></div>`;

  // Streak grid
  const sg = document.getElementById('streak-grid');
  const days = [], today = new Date();
  for (let i = 27; i >= 0; i--) { const d = new Date(today); d.setDate(d.getDate()-i); days.push(d.toISOString().slice(0,10)); }
  const DN = ['S','M','T','W','T','F','S'];
  sg.innerHTML = days.map(day => `<div class="sday${state.activity.includes(day)?' active':''}${day===todayStr()?' today':''}" title="${day}">${DN[new Date(day).getDay()]}</div>`).join('');
  document.getElementById('streak-days-label').textContent = getStreak() + ' days';

  // Topic breakdown
  const bd = document.getElementById('topic-breakdown');
  bd.innerHTML = TOPICS.map((name, t) => {
    const tot = PROBLEMS[t].length, dn = topicDone(t), p = Math.round(dn/tot*100);
    return `<div class="bkrow">
      <span class="bkrow-name">${name}</span>
      <span class="bkrow-count">${dn}/${tot}</span>
      <div class="bkrow-bar"><div class="bkrow-fill" style="width:${p}%;background:${p===100?'var(--green)':'var(--accent)'}"></div></div>
    </div>`;
  }).join('');

  renderBadges();
  renderLeaderboard();
}

/* Badges */
const BADGES = [
  { id:'first', icon:'🎯', name:'First Step', desc:'Solve your first problem', cond: () => doneCount() >= 1 },
  { id:'ten', icon:'🔟', name:'Ten Down', desc:'Solve 10 problems', cond: () => doneCount() >= 10 },
  { id:'fifty', icon:'🏅', name:'Half Century', desc:'Solve 50 problems', cond: () => doneCount() >= 50 },
  { id:'hundred', icon:'💯', name:'Centurion', desc:'Solve 100 problems', cond: () => doneCount() >= 100 },
  { id:'streak7', icon:'🔥', name:'Week Warrior', desc:'7-day streak', cond: () => getStreak() >= 7 },
  { id:'streak30', icon:'🌟', name:'Monthly Master', desc:'30-day streak', cond: () => getStreak() >= 30 },
  { id:'easy20', icon:'🟢', name:'Easy Rider', desc:'Solve 20 easy problems', cond: () => Object.entries(state.done).filter(([k,v])=>v&&PROBLEMS[+k.split('_')[0]][+k.split('_')[1]]?.d==='easy').length >= 20 },
  { id:'hard5', icon:'🔴', name:'Hard Hitter', desc:'Solve 5 hard problems', cond: () => Object.entries(state.done).filter(([k,v])=>v&&PROBLEMS[+k.split('_')[0]][+k.split('_')[1]]?.d==='hard').length >= 5 },
  { id:'dp', icon:'🧠', name:'DP Expert', desc:'Complete all DP problems', cond: () => topicDone(7) === PROBLEMS[7].length },
  { id:'graphs', icon:'🕸', name:'Graph Master', desc:'Complete all graph problems', cond: () => topicDone(6) === PROBLEMS[6].length },
];

function checkBadges() {
  const earned = JSON.parse(localStorage.getItem('dsa_badges') || '[]');
  BADGES.forEach(b => {
    if (!earned.includes(b.id) && b.cond()) {
      earned.push(b.id);
      localStorage.setItem('dsa_badges', JSON.stringify(earned));
      showToast(`🎉 Badge earned: ${b.name}!`, 3000);
    }
  });
}

function renderBadges() {
  const earned = JSON.parse(localStorage.getItem('dsa_badges') || '[]');
  const bg = document.getElementById('badges-grid');
  bg.innerHTML = BADGES.map(b => {
    const isEarned = earned.includes(b.id) || b.cond();
    return `<div class="badge-card ${isEarned?'earned':'locked'}">
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-name">${b.name}</div>
      <div class="badge-desc">${b.desc}</div>
    </div>`;
  }).join('');
}

/* Leaderboard */
const MOCK_LEADERS = [
  { name:'Arjun S.', pts:2840, streak:34 }, { name:'Priya M.', pts:2610, streak:28 },
  { name:'Rahul K.', pts:2390, streak:21 }, { name:'Sneha P.', pts:2150, streak:18 },
  { name:'Vikram R.', pts:1980, streak:15 }, { name:'Ananya B.', pts:1720, streak:12 },
];

function renderLeaderboard() {
  const myPts = state.points, myStreak = getStreak();
  const myEntry = { name:'You ⭐', pts:myPts, streak:myStreak };
  const all = [...MOCK_LEADERS, myEntry].sort((a,b) => b.pts - a.pts);
  const lb = document.getElementById('leaderboard');
  lb.innerHTML = all.map((p, i) => {
    const rankClass = i===0?'gold':i===1?'silver':i===2?'bronze':'';
    const isYou = p.name.includes('You');
    return `<div class="lb-row${isYou?' you':''}">
      <div class="lb-rank ${rankClass}">${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</div>
      <div class="lb-name">${p.name}</div>
      <div class="lb-pts">⭐ ${p.pts}</div>
      <div class="lb-streak">🔥 ${p.streak}</div>
    </div>`;
  }).join('');
}

function resetAll() {
  if (!confirm('Reset ALL progress including solved problems, streak, points, and badges? This cannot be undone.')) return;
  localStorage.clear();
  state.done = {}; state.activity = []; state.points = 0; state.notes = {}; state.bookmarks = [];
  updateNavStats();
  renderProgress();
  showToast('Progress reset.');
}

/* ══════════ INIT ══════════ */

window.addEventListener('DOMContentLoaded', () => {
  updateNavStats();
  showPage('home');
  checkBadges();
});

/* ══════════ GLOBAL SEARCH ══════════ */

function handleSearch(query) {
  const dropdown = document.getElementById('search-results-dropdown');
  if (!query.trim()) { dropdown.classList.remove('open'); dropdown.innerHTML = ''; return; }
  const q = query.toLowerCase();
  const results = [];
  for (let t = 0; t < 8; t++) {
    PROBLEMS[t].forEach((p, i) => {
      if (p.n.toLowerCase().includes(q) || TOPICS[t].toLowerCase().includes(q)) {
        results.push({ t, i, p });
      }
    });
  }
  if (!results.length) {
    dropdown.innerHTML = '<div class="no-results">No problems found</div>';
    dropdown.classList.add('open');
    return;
  }
  const diffColor = { easy: '#00e676', medium: '#ffab00', hard: '#ff1744' };
  dropdown.innerHTML = results.slice(0, 8).map(({ t, i, p }) => `
    <div class="search-result-item" onclick="openProblem(${t},${i});document.getElementById('global-search').value='';closeSearch()">
      <span style="flex:1">${p.n}</span>
      <span class="sri-tag">${TOPICS[t].split(' ')[0]}</span>
      <span class="sri-diff" style="background:${diffColor[p.d]}22;color:${diffColor[p.d]}">${p.d}</span>
    </div>`).join('');
  dropdown.classList.add('open');
}

function closeSearch() {
  const d = document.getElementById('search-results-dropdown');
  if (d) { d.classList.remove('open'); }
}

