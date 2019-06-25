import { Fun } from "../rule";

type Sum = <c,a,b>(f:Fun<a,c>, g:Fun<b,c>) => Fun<Sum<a,b>,c>

type id<a> = a
let id = <a>() : Fun<a,a> => Fun(x => x)
const map_Id = <a,b>(f:Fun<a,b>) : Fun<id<a>,id<b>> => { }

type Option<a> = { kind:"none" } | { kind:"some", value:a }
const map_Option = <a,b>(f:Fun<a,b>) : Fun<Option<a>,Option<b>> => {}

const hd = <a>(l:List<a>) : Option<a> => {}


// type Option<a> = a | null
// const map_Option = <a,b>(f:Fun<a,b>) : Fun<Option<a>,Option<b>> => ...


let map_Sum = <a,b,a1,b1>(f:Fun<a,a1>, g:Fun<b,b1>) =>
    Fun<Sum<a,b>,Sum<a1,b1>>(());

let map_Sum_Left = <c,a,a1>(f:Fun<a,a1>) :
    Fun<Sum<a,c>,Sum<a1,c>> => map_Sum(f, id<c>());

let map_Sum_Right = <c,b,b1>(f:Fun<b,b1>) :
    Fun<Sum<c,b>,Sum<c,b1>> => map_Sum(id<c>(), f)

//Identity
//[1,2,3] -> [[1],[2],[3]] -> [1,2,3]
//[1,2,3] -> [[1,2,3]] -> [1,2,3]  
//Associative
//[[[1],[2]],[[3]]] -> [[1,2],[3]] -> [1,2,3]
//[[[1],[2]],[[3]]] -> [[1],[2],[3]] -> [1,2,3]

// natural transformation

// IDENTITY LAW MONAD
// M?; µ = ?M; µ

// ASOCIATIVE LAW MONAD
// Mµ; µ = µM; µ

// ? = UNIT

// µ = MAP

// I= THE IDENTITY FUNCTOR


// b^a means morphisms from a to b

// ?:c?b^a

// eval:b^ a × a ? b
 

// OPTION IS DEFINED AS THE LEFT FUNCTOR OF A+1

// IDENTITY LAW
// [1,2,3] -> [[1],[2],[3]] -> [1,2,3]
// AND
// [1,2,3] -> [[1,2,3]] -> [1,2,3]


// ASSOCIATION LAW

// [[[1],[2]],[[3]]] -> [[1,2],[3]] -> [1,2,3]
// AND
// [[[1],[2]],[[3]]] -> [[1],[2],[3]] -> [1,2,3]


// SUM
// <c,a,b>(f:Fun<c,a>, Fun<c,b>) => Fun<c,Sum<a,b>>

// Consider exponentials. The functorial mapping is implemented as:
// const map_Fun = <a,b,c>(g:Fun<b,c>) : Fun<Fun<a,b>,Fun<a,c>> =>
//   f => f.then(g)

// eval : <a,b>() => Fun<Pair<Fun<a,b>,a>,b>
// curry : <a,b,c>(f:Fun<Pair<c,a>,b>) : Fun<c,Fun<a,b>>

