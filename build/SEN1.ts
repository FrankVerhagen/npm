import * as Immutable from "immutable"

type Fun<a,b> = {
    f:(_:a) => b,
    then:<c>(g:Fun<b,c>) => Fun<a,c>
}

let Fun = <a,b>(f:(_:a)=>b):Fun<a,b> =>{
    return {
        f:f,
        then: function<c>(g:Fun<b,c>) : Fun<a,c> {
            return then(this, g);
        }
    }
}

let then = function<a,b,c>(f:Fun<a,b>,g:Fun<b,c>) : Fun<a,c> {
    return Fun<a,c>((a:a) => g.f(f.f(a)));
}

let id = <a>() : Fun<a,a> => Fun(x => x)

let incr : Fun<number,number> = Fun(x => x + 1)
let double : Fun<number,number> = Fun(x => x * 2)
let decr : Fun<number,number> = Fun(x => x - 1)
let is_even : Fun<number,boolean> = Fun(x => x % 2 == 0)
let str_len : Fun<string,number> = Fun(x => x.length)

type Countainer<a> = { value:a, counter:number }
let map_Countainer = <a,b>(f:Fun<a,b>) : Fun<Countainer<a>, Countainer<b>> =>
  Fun(c => ({...c, value:f.f(c.value) }))
let id_Countainer = <a>() : Fun<Countainer<a>,Countainer<a>> => map_Countainer(id<a>())
/*
id_Countainer == id<Countainer<a>>
map_Countainer(f.then(g)) == map_Countainer(f).then(map_Countainer(g))
*/

let c_i:Countainer<number> = { value:10, counter:0 }
let c_s:Countainer<string> = { value:"ten", counter:1 }

let make_money = <a>(c:Countainer<a>) => ({...c, counter:c.counter+1})

let incr_countainer =
  map_Countainer(incr)
let double_countainer =
  map_Countainer(double)
let is_even_countainer =
  map_Countainer(is_even)
let length_countainer =
  map_Countainer(str_len)


/*
type F<a> = ...
let map_F = <a,b>(f:Fun<a,b>) : Fun<F<a>, F<b>> =>

let id_F = <a>() => map_F(id<a>())
id_F == id<F<a>>
map_F(f.then(g)) == map_F(f).then(map_F(g))
*/

type Either<a,b> = { kind:"left", v:a } | { kind:"right", v:b }
// Either<a,b> = a + b


// type Option<a> = { kind:"none" } | { kind:"some", value:a }
// let none = <a>() : Fun<{},Option<a>> => Fun<{},Option<a>>(_ => ({ kind:"none" }))
// let some = <a>() : Fun<a,Option<a>> => Fun<a,Option<a>>(x => ({ kind:"some", value:x }))

// let match = <a,c>(f:Fun<a,c>, g:Fun<{},c>) : Fun<Option<a>,c> =>
//   Fun(x => x.kind == "none" ? g.f({}) : f.f(x.value))

// let map_Option = <a,b>(f:Fun<a,b>) : Fun<Option<a>, Option<b>> =>
//   match<a,Option<b>>(f.then(some<b>()), none<b>())

// // let id_Option = <a>() => map_Option(id<a>())
// // id_F == id<Option<a>>
// // map_F(f.then(g)) == map_F(f).then(map_F(g))

// type SMM<a> = Option<Countainer<a>>
// let map_SMM = <a,b>(f:Fun<a,b>) : Fun<SMM<a>,SMM<b>> => map_Option(map_Countainer(f))

// let f:Fun<SMM<string>,SMM<boolean>> = map_SMM(str_len.then(incr).then(is_even))

type Pair<a,b> = { a:a, b:b }
let map_Pair = <a1,b1,a2,b2>(f:Fun<a1,a2>, g:Fun<b1,b2>) : Fun<Pair<a1,b1>, Pair<a2,b2>> =>
  Fun(p => ({ a:f.f(p.a), b:g.f(p.b) }))

let apply = <a,b>() : Fun<Pair<Fun<a,b>,a>, b> => Fun(p => p.a.f(p.b))

type Unit = {}
let Unit : Unit = {}

let zero_int : Fun<Unit,number> = Fun((_:Unit) => 0)
let plus_int : Fun<Pair<number,number>, number> = Fun(ab => ab.a + ab.b)

let verify_identity_int = (x:number) =>
  plus_int.f({ a:zero_int.f(Unit), b:x }) == x &&
  plus_int.f({ b:zero_int.f(Unit), a:x }) == x

let verify_assoc_int = (a:number, b:number, c:number) =>
  plus_int.f({ a:plus_int.f({ a:a, b:b }), b:c }) ==
  plus_int.f({ a:a, b:plus_int.f({ a:b, b:c }) })


type Id<a> = a
let map_Id = <a,b>(f:Fun<a,b>) : Fun<Id<a>, Id<b>> => f

// let unit_Option = <a>() : Fun<Id<a>, Option<a>> => some<a>()
//   // Fun((x:a) : Option<a> => some<a>().f(x))

// let join_Option = <a>() : Fun<Option<Option<a>>, Option<a>> =>
//   Fun(o_o => o_o.kind == "none" ? none<a>().f({}) : o_o.value)


let unit_Countainer = <a>() : Fun<Id<a>, Countainer<a>> =>
  Fun(x => ({ value:x, counter:0 }))

let join_Countainer = <a>() : Fun<Countainer<Countainer<a>>, Countainer<a>> =>
  Fun(c_c => ({ value:c_c.value.value, counter:c_c.counter+c_c.value.counter }))



type Fun_n<c,a> = Fun<c, a>

let unit_Fun_n = <a,c>() : Fun<Id<a>,Fun_n<c,a>> =>
  Fun((v:a) => Fun<c,a>(_ => v))

let map_Fun_n = <c,a,b>(f:Fun<a,b>) : Fun<Fun_n<c,a>,Fun_n<c,b>> =>
  Fun((g:Fun_n<c,a>) => g.then(f))

let join_Fun_n = <c,a>() : Fun<Fun_n<c, Fun_n<c, a>>, Fun_n<c, a>> =>
  Fun((f:Fun_n<c, Fun_n<c, a>>) => Fun<c, a>(n => f.f(n).f(n)))



type LP<a> = Pair<a, number>
let unit_LP = <a>() : Fun<Id<a>,LP<a>> =>
  Fun(v => ({ a:v, b:1 }))

let map_LP = <a,b>() : Fun<Fun<a,b>, Fun<LP<a>, LP<b>>> =>
  Fun(f => Fun(lp_a => ({ a:f.f(lp_a.a), b:lp_a.b })))

let join_LP = <a>() : Fun<LP<LP<a>>, LP<a>> =>
  Fun((x:LP<LP<a>>) => ({ a:x.a.a, b:x.b*x.a.b }))



interface Option<a> { v:({ k:"n" } | { k:"s", v:a }), then:<b>(k:(_:a) => Option<b>) => Option<b> }
let none = <a>() : Option<a> => ({ v: {k:"n"}, then:function<b>(this:Option<a>,k:(_:a) => Option<b>) { return bind_Option(this, k)} })
let some = <a>() : Fun<a, Option<a>> => Fun<a, Option<a>>(x => ({ v:{ k:"s", v:x }, then:function<b>(this:Option<a>,k:(_:a) => Option<b>) { return bind_Option(this, k)} }))
let map_Option = <a,b>(f:Fun<a,b>) : Fun<Option<a>, Option<b>> =>
  Fun(x => x.v.k == "n" ? none<b>() : f.then(some<b>()).f(x.v.v) )

let unit_Option = <a>() => some<a>()
let join_Option = <a>() : Fun<Option<Option<a>>, Option<a>> =>
  Fun(x => x.v.k == "n" ? none<a>() : x.v.v)

let bind_Option = <a,b>(p:Option<a>, k:(_:a) => Option<b>) : Option<b> => map_Option<a,Option<b>>(Fun(k)).then(join_Option<b>()).f(p)

// let safe_div = (a:Option<number>, b:Option<number>) : Option<number> =>
//   a.then(a_v =>
//   b.then(b_v =>
//   b_v == 0 ? none<number>() : some<number>().f(a_v / b_v)))

// let n1 = some<number>().f(10)
// let n2 = some<number>().f(2)
// safe_div(n1, safe_div(n2, n1)).then(res =>
// ...)


let log = ""
let add1 = (x:number, y:number) : number => {
  log = log + `add(${x},${y})`
  return x + y
}

let add2 = (x:number, y:number) : Fun<string, Pair<number, string>> => {
  let res = x + y
  return Fun((log:string) => ({ a:res, b:log + `add(${x},${y})` }))
}

interface Counter { v:number }
let add3 = (x:number, y:number) : Fun<Counter, Pair<number, Counter>> => {
  let res = x + y
  return Fun(log => ({ a:res, b:{...log, v:log.v+1} }))
}

interface St<s,a> { run:Fun<s, Pair<a, s>>, then:<b>(k:(_:a) => St<s,b>) => St<s,b> }
let run_St = <s,a>() : Fun<St<s,a>, Fun<s, Pair<a, s>>> => Fun(p => p.run)
let mk_St = <s,a>(run:Fun<s, Pair<a, s>>) : St<s,a> => ({ run:run, then:function<b>(this:St<s,a>, k:(_:a) => St<s,b>) : St<s,b> { return bind_St(this,k)} })
let map_St = <s,a,b>(f:Fun<a,b>) : Fun<St<s,a>, St<s,b>> =>
  Fun((p:St<s,a>) : St<s,b> => mk_St(p.run.then(map_Pair<a,s,b,s>(f, id()))))

let unit_St = <s, a>(a:a) : St<s,a> =>
  mk_St(Fun(s => ({ a:a, b:s})))

let join_St = <s,a>() : Fun<St<s,St<s,a>>, St<s,a>> =>
  Fun((p:St<s,St<s,a>>) : St<s,a> => mk_St<s,a>(p.run.then(map_Pair(run_St(), id())).then(apply())))

let bind_St = <s,a,b>(p:St<s,a>, k:(_:a) => St<s,b>) : St<s,b> =>
  map_St<s,a,St<s,b>>(Fun(k)).then(join_St<s,b>()).f(p)


let add_st = <s>(p:St<s,number>, q:St<s,number>) : St<s,number> =>
  p.then(p_v =>
  q.then(q_v =>
  unit_St(p_v + q_v)))


interface StFail<s,a> {
  run:Fun<s, Option<Pair<a, s>>>,
  then:<b>(k:(_:a) => StFail<s,b>) => StFail<s,b> }
let run_StFail = <s,a>() : Fun<StFail<s,a>, Fun<s, Option<Pair<a, s>>>> => Fun(p => p.run)
let mk_StateFail = <s,a>(run:Fun<s, Option<Pair<a, s>>>) : StFail<s,a> =>
  ({ run:run, then:function<b>(this:StFail<s,a>, k:(_:a) => StFail<s,b>) { return bind_StFail(this, k) } })

let unit_StFail = <s,a>(a:a) : StFail<s,a> =>
  mk_StateFail(Fun(s => unit_Option<Pair<a,s>>().f({ a:a, b:s })))

let fail_StFail = <s,a>() : StFail<s,a> =>
  mk_StateFail(Fun(s => none()))

let map_StFail = <s,a,b>(f:Fun<a,b>) : Fun<StFail<s,a>, StFail<s,b>> =>
  Fun((p:StFail<s,a>) => mk_StateFail(p.run.then(map_Option(map_Pair(f, id<s>())))))

let join_StFail = <s,a>() : Fun<StFail<s, StFail<s,a>>, StFail<s,a>> =>
  Fun((p:StFail<s, StFail<s,a>>) =>
    mk_StateFail(
      p.run.then(
        map_Option(
          map_Pair(
            run_StFail<s,a>(), id<s>()).then(apply())).then(
        join_Option()))
    )
  )

let bind_StFail = <s,a,b>(p:StFail<s,a>, k:(_:a) => StFail<s,b>) : StFail<s,b> =>
  map_StFail<s, a, StFail<s,b>>(Fun(k)).then(join_StFail()).f(p)

let get_st_fail = <s>() : StFail<s,s> =>
  mk_StateFail(Fun(s => some<Pair<s,s>>().f({ a:s, b:s })))

let set_st_fail = <s>(new_s:s) : StFail<s,Unit> =>
  mk_StateFail(Fun(s => some<Pair<Unit,s>>().f({ a:{}, b:new_s })))

let together = <s,a,b>(p:StFail<s,a>, q:StFail<s,b>) : StFail<s,Pair<a,b>> =>
  p.then(p_v =>
  q.then(q_v =>
  unit_StFail({ a:p_v, b:q_v })))

let mt_if = <s,a>(c:StFail<s,boolean>, t:StFail<s,a>, e:StFail<s,a>) : StFail<s,a> =>
  c.then(c_v => c_v ? t : e)


type Memory = Immutable.Map<string, number>
type FakeThread<a> = StFail<Memory, a>

let get_var = (v:string) : FakeThread<number> =>
  get_st_fail<Memory>().then(m =>
    m.has(v) ? unit_StFail(m.get(v))
    : fail_StFail<Memory,number>()
  )

let set_var = (v:string, e:number) : FakeThread<Unit> =>
  get_st_fail<Memory>().then(m =>
  set_st_fail<Memory>(m.set(v, e)))

let swap_a_b : FakeThread<number> =
  together(get_var("a"), get_var("b")).then(({ a:a_v, b:b_v }) =>
  together(set_var("a", b_v), set_var("b", a_v)).then(_ =>
  unit_StFail(a_v + b_v)
  ))

let initial_memory = Immutable.Map<string,number>([ ["a", 1], ["b", 2]])


type ThreadResult<s,e,a> =
          { k:"res", v:Pair<s,a> }
        | { k:"fail", v:e }
        | { k:"brrrr", v:Pair<Thread<s,e,a>, s> }

interface Thread<s,e,a> {
  run:Fun<s, ThreadResult<s,e,a>>,
}

let mk_Thread = <s,e,a>(run:Fun<s, ThreadResult<s,e,a>>):Thread<s,e,a> => ({ run:run })

let map_ThreadResult = <s,e,a,b>(f:Fun<a,b>) : Fun<ThreadResult<s,e,a>, ThreadResult<s,e,b>> =>
  Fun((r:ThreadResult<s,e,a>) :ThreadResult<s,e,b> =>
    r.k == "res" ?
      ({ k:"res", v:map_Pair<s,a,s,b>(id<s>(), f).f(r.v) })
    : r.k == "fail" ?
      ({ k:"fail", v:r.v })
    : ({ k:"brrrr", v:map_Pair(map_Thread<s,e,a,b>(f), id<s>()).f(r.v) })
  )

let map_Thread = <s,e,a,b>(f:Fun<a,b>) : Fun<Thread<s,e,a>, Thread<s,e,b>> =>
  Fun((p:Thread<s,e,a>) : Thread<s,e,b> =>
    mk_Thread(
      p.run.then(map_ThreadResult<s,e,a,b>(f))
    ))

let unit = <s,e,a>(a:a) : Thread<s,e,a> =>
  mk_Thread(Fun((s0:s) : ThreadResult<s,e,a> => ({ k:"res", v:{ a:s0, b:a } })))
let fail = <s,e,a>(e:e) : Thread<s,e,a> =>
  mk_Thread(Fun((s0:s) : ThreadResult<s,e,a> => ({ k:"fail", v:e })))
let freeze = <s,e>() : Thread<s,e,Unit> =>
  mk_Thread(Fun((s0:s) : ThreadResult<s,e,Unit> => ({ k:"brrrr", v:{ a:unit({}), b:s0 } })))



let join_Thread = <s,e,a>() : Fun<Thread<s,e,Thread<s,e,a>>, Thread<s,e,a>> =>
  Fun((pp:Thread<s,e,Thread<s,e,a>>) : Thread<s,e,a> =>
    mk_Thread(
      Fun((s0:s) : ThreadResult<s,e,a> => {
        let qp:ThreadResult<s,e,Thread<s,e,a>> = pp.run.f(s0)
        if (qp.k == "res") {
          let p:Thread<s,e,a> = qp.v.b
          let s1 = qp.v.a
          let q:ThreadResult<s,e,a> = p.run.f(s1)
          return q
        } else  if (qp.k == "fail") {
          return { k:"fail", v:qp.v }
        } else {
          let pp1:Thread<s,e,Thread<s,e,a>> = qp.v.a
          let s1 = qp.v.b
          let p:Thread<s,e,a> = join_Thread<s,e,a>().f(pp1)
          let q:ThreadResult<s,e,a> = p.run.f(s1)
          return q
        }
      }
    ))
  )
