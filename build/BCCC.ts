export type Sum<a, b> = { kind: "left", value: a } | { kind: "right", value: b }
let plus = <c, a, b>(f: (_: a) => c, g: (_: b) => c) => (x: Sum<a, b>) => x.kind == "left" ? f(x.value) : g(x.value)
let plus_par = function <a, b, c, d>(f: Fun<a, b>, g: Fun<c, d>): Fun<Sum<a, c>, Sum<b, d>> {
    return (f.then(inl<b, d>())).plus((g.then(inr<b, d>())))
}
export let curry = function <a, b, c>(f: Fun<Prod<a, b>, c>): Fun<a, Fun<b, c>> { return fun(a => fun(b => f.f({ fst: a, snd: b }))) }


export interface Prod<a, b> { fst: a, snd: b }
// export let mk_pair = <a,b>(x:a) : (y:b) => Prod<a,b> => y => ({ fst:x, snd:y })
let times = <c, a, b>(f: (_: c) => a, g: (_: c) => b) => (x: c): Prod<a, b> => ({ fst: f(x), snd: g(x) })
let times_par = function <a, b, c, d>(f: Fun<a, c>, g: Fun<b, d>): Fun<Prod<a, b>, Prod<c, d>> {
    return (fst<a, b>().then(f)).times(snd<a, b>().then(g))
}

export interface Exp<b, a> extends Fun<a, b> { }
export let exp: <a, b>(f: (_: a) => b) => Exp<b, a> = fun
export type Plus<a, b> = Sum<a, b>
export type Times<a, b> = Prod<a, b>

// _+c
export let map_sum_left = function <a, b, c>(): Fun<Fun<a, b>, Fun<Sum<a, c>, Sum<b, c>>> {
    let f = distribute_sum_prod<Fun<a, b>, a, c>()
    let g = apply_pair<a, b>()
    let h = snd<Fun<a, b>, c>()
    let i = g.map_plus(h)
    return curry(f.then(i))
}
// c+_
export let map_sum_right = function <a, b, c>(): Fun<Fun<a, b>, Fun<Sum<c, a>, Sum<c, b>>> {
    let f = distribute_sum_prod<Fun<a, b>, c, a>()
    let g = apply_pair<a, b>()
    let h = snd<Fun<a, b>, c>()
    let i = h.map_plus(g)
    return curry(f.then(i))
}

export interface St<S, A> extends Fun<S, Prod<A, S>> { }
export type State<S, A> = {
    run: St<S, A>,
    then: <B>(k: (_: A) => State<S, B>) => State<S, B>;
    ignore: () => State<S, Unit>;
    ignore_with: <B>(x: B) => State<S, B>;
    map: <B>(f: Fun<A, B>) => State<S, B>
}

export let mk_state = function <S, A>(run: Fun<S, Prod<A, S>>): State<S, A> {
    return ({
        run: run,
        then: function <A, B>(this: State<S, A>, k: (_: A) => State<S, B>): State<S, B> {
            return st_join(this.map(fun(k)))
        },
        ignore: function (this: State<S, A>): State<S, Unit> {
            return this.ignore_with<Unit>(unit().f({}))
        },
        ignore_with: function <B>(this: State<S, A>, y: B): State<S, B> {
            return this.map(constant(y))
        },
        map: function <B>(this: State<S, A>, f: Fun<A, B>): State<S, B> {
            return mk_state<S, B>(f.map_times(id<S>()).after(this.run))
        }
    })
}

export let st_run = function <s, a>(): Fun<State<s, a>, St<s, a>> { return fun(p => p.run) }

export let st_join = function <S, A>(pp: State<S, State<S, A>>): State<S, A> {
    let g = fst<State<S, A>, S>().then(st_run<S, A>()).times(snd<State<S, A>, S>()).then(apply_pair())
    let h = st_run<S, State<S, A>>().map_times(id<S>()).then(apply_pair()).then(g)
    return mk_state<S, A>(apply(curry(h), pp))
}

export let st_get_state = function <S>(): State<S, S> { return mk_state<S, S>(id<S>().times(id<S>())) }
export let st_set_state = function <S>(s: S): State<S, Unit> { return mk_state<S, Unit>(unit<S>().times(constant<S, S>(s))) }

export let st_unit = function <S, A>(x: A): State<S, A> { return mk_state<S, A>(constant<S, A>(x).times(id<S>())) }

export interface StRef<s, a> { get: State<s, a>, set: (_: a) => State<s, Unit> }



export type Option<A> = Sum<A, Unit>
//export let none = <A>() : Option<A> => apply(unit().then(inr<A,Unit>()), null)
export let some = <A>(x:A) : Option<A> => apply(inl<A,Unit>(), x)

// export let map = <A,B>(p:Option<A>, f:(_:A)=>B) : Option<B> =>
//   CCC.apply(CCC.fun<A,Option<B>>(x => some<B>(f(x))).plus(CCC.fun<CCC.Unit,Option<B>>(_ => none<B>())), p)

// export let to_array = <A>(p:Option<A>) : Array<A> =>
//   CCC.apply(CCC.fun<A,Array<A>>(x => [x]).plus(CCC.fun<CCC.Unit,Array<A>>(_ => [])), p)

// export let to_list = <A>(p:Option<A>) : Immutable.List<A> =>
//   Immutable.List<A>(to_array(p))

// export let merge = <S,T>(f:(_:S) => Option<T>, g:(_:S) => Option<T>) : ((_:S) => Option<T>) =>
//   s => CCC.apply(CCC.fun(f).then<Option<T>>(CCC.id<T>().map_plus(CCC.fun(_ => g(s)))), s)

export let map_plus_left = function<a,b,c>() : Fun<Fun<a,c>,Fun<Sum<a,b>, Sum<c,b>>> {
    let f = id<Fun<a,c>>().times(constant<Fun<a,c>,Fun<b,b>>(id<b>()))
    return f.then(plus_par_cat())
  }
  
  export let map_plus_right = function<a,b,c>() : Fun<Fun<b,c>,Fun<Sum<a,b>, Sum<a,c>>> {
    let f = constant<Fun<b,c>,Fun<a,a>>(id<a>()).times(id<Fun<b,c>>())
    return f.then(plus_par_cat())
  }

export let id = function <a>(): Fun<a, a> { return fun(x => x) }

export let constant = <c, a>(a: a): Fun<c, a> => fun(x => a)

export type Zero = never
export let absurd = <a>(): Fun<Zero, a> => fun<Zero, a>(_ => { throw "Does not exist." })

export interface Unit { }
export let unit = <a>(): Fun<a, Unit> => fun(x => ({}))



export interface Fun<a, b> {
    f: (_: a) => b
    after: <c>(f: Fun<c, a>) => Fun<c, b>
    then: <c>(f: Fun<b, c>) => Fun<a, c>
    plus: <c>(g: Fun<c, b>) => Fun<Sum<a, c>, b>
    map_plus: <c, d>(g: Fun<c, d>) => Fun<Sum<a, c>, Sum<b, d>>
    times: <c>(g: Fun<a, c>) => Fun<a, Prod<b, c>>
    map_times: <c, d>(g: Fun<c, d>) => Fun<Prod<a, c>, Prod<b, d>>,
    map_times_left: <c>() => Fun<Prod<a, c>, Prod<b, c>>,
    map_times_right: <c>() => Fun<Prod<c, a>, Prod<c, b>>
    map_sum_left: <c>() => Fun<Sum<a, c>, Sum<b, c>>,
    map_sum_right: <c>() => Fun<Sum<c, a>, Sum<c, b>>,
}

export let fun = <a, b>(f: (_: a) => b): Fun<a, b> => ({
    f: f,
    after: function <c>(this: Fun<a, b>, g: Fun<c, a>): Fun<c, b> { return fun<c, b>((x) => this.f(g.f(x))) },
    then: function <c>(this: Fun<a, b>, g: Fun<b, c>): Fun<a, c> { return fun<a, c>((x) => g.f(this.f(x))) },
    plus: function <c>(this: Fun<a, b>, g: Fun<c, b>): Fun<Sum<a, c>, b> { return fun(plus(this.f, g.f)) },
    map_plus: function <c, d>(this: Fun<a, b>, g: Fun<c, d>): Fun<Sum<a, c>, Sum<b, d>> { return plus_par(this, g) },
    times: function <c>(this: Fun<a, b>, g: Fun<a, c>): Fun<a, Prod<b, c>> { return fun(times(this.f, g.f)) },
    map_times: function <c, d>(this: Fun<a, b>, g: Fun<c, d>): Fun<Prod<a, c>, Prod<b, d>> { return times_par(this, g) },
    map_times_left: function <c>(this: Fun<a, b>): Fun<Prod<a, c>, Prod<b, c>> { return apply(map_times_left<a, b, c>(), this) },
    map_times_right: function <c>(this: Fun<a, b>): Fun<Prod<c, a>, Prod<c, b>> { return apply(map_times_right<a, b, c>(), this) },
    map_sum_left: function <c>(this: Fun<a, b>): Fun<Sum<a, c>, Sum<b, c>> { return apply(map_sum_left<a, b, c>(), this) },
    map_sum_right: function <c>(this: Fun<a, b>): Fun<Sum<c, a>, Sum<c, b>> { return apply(map_sum_right<a, b, c>(), this) },
})
export let defun = <a, b>(f: Fun<a, b>): ((_: a) => b) => f.f

export let fun2 = <a, b, c>(f: (x: a, y: b) => c): Fun<Prod<a, b>, c> => fun(ab => f(ab.fst, ab.snd))
export let fun3 = <a, b, c, d>(f: (x: a, y: b, z: c) => d): Fun<Prod<a, Prod<b, c>>, d> => fun(abc => f(abc.fst, abc.snd.fst, abc.snd.snd))

export let apply = <a, b>(f: Fun<a, b>, x: a): b => f.f(x)
export let apply_pair = function <a, b>(): Fun<Prod<Fun<a, b>, a>, b> { return fun(p => p.fst.f(p.snd)) }


export let uncurry = function <a, b, c>(f: Fun<a, Fun<b, c>>): Fun<Prod<a, b>, c> {
    let j1: Fun<Prod<Prod<Fun<a, Fun<b, c>>, a>, b>, c> = apply_pair<a, Fun<b, c>>().map_times(id<b>()).then(apply_pair())
    let conv = ((fst<Fun<a, Fun<b, c>>, Prod<a, b>>().times(snd<Fun<a, Fun<b, c>>, Prod<a, b>>().then(fst()))).times(snd<Fun<a, Fun<b, c>>, Prod<a, b>>().then(snd())))
    let j: Fun<Prod<Fun<a, Fun<b, c>>, Prod<a, b>>, c> = conv.then(j1)
    let g = fst<Fun<a, Fun<b, c>>, Prod<a, b>>().times(snd<Fun<a, Fun<b, c>>, Prod<a, b>>().then(fst())).then(
        apply_pair()).times(snd<Fun<a, Fun<b, c>>, Prod<a, b>>().then(snd())).then(apply_pair())
    return apply(curry(g), f)
}


export let fst = function <a, b>(): Fun<Prod<a, b>, a> { return fun<Prod<a, b>, a>(p => p.fst) }
export let snd = function <a, b>(): Fun<Prod<a, b>, b> { return fun<Prod<a, b>, b>(p => p.snd) }
export let inl = function <a, b>(): Fun<a, Sum<a, b>> { return fun<a, Sum<a, b>>(x => ({ kind: "left", value: x })) }
export let inr = function <a, b>(): Fun<b, Sum<a, b>> { return fun<b, Sum<a, b>>(x => ({ kind: "right", value: x })) }

// some simple samples
// let incr:Fun<number,number> = fun(x => x + 1)
// let decr:Fun<number,number> = fun(x => x - 1)
// let is_even:Fun<number,boolean> = fun(x => x % 2 == 0)
// let not:Fun<boolean,boolean> = fun(x => !x)
// let f:Fun<Sum<number,boolean>,Sum<boolean,boolean>> = is_even.map_plus(not)


// a * (b+c) = a*b + a*c
export let distribute_sum_prod = function <a, b, c>(): Fun<Prod<a, Sum<b, c>>, Sum<Prod<a, b>, Prod<a, c>>> {
    let f1: Fun<Prod<b, a>, Sum<Prod<a, b>, Prod<a, c>>> = swap_prod<b, a>().then(inl())
    let f = curry(f1)
    let g1: Fun<Prod<c, a>, Sum<Prod<a, b>, Prod<a, c>>> = swap_prod<c, a>().then(inr())
    let g = curry(g1)
    let j = id<a>().map_times(f.plus(g)).then(swap_prod()).then(apply_pair())
    return j
}

export let distribute_sum_prod_inv = function <a, b, c>(): Fun<Sum<Prod<a, b>, Prod<a, c>>, Prod<a, Sum<b, c>>> {
    return fst<a, b>().times(inl<b, c>().after(snd<a, b>())).plus(
        fst<a, c>().times(inr<b, c>().after(snd<a, c>())))
}

// a^(b+c) = a^b * a^c
export let distribute_exp_sum = function <a, b, c>(): Fun<Fun<Plus<a, b>, c>, Prod<Fun<a, c>, Fun<b, c>>> {
    let f1: Fun<Prod<Fun<Plus<a, b>, c>, a>, c> = (id<Fun<Plus<a, b>, c>>().map_times(inl<a, b>())).then(apply_pair())
    let f = curry(f1)
    let g1: Fun<Prod<Fun<Plus<a, b>, c>, b>, c> = (id<Fun<Plus<a, b>, c>>().map_times(inr<a, b>())).then(apply_pair())
    let g = curry(g1)
    let i = f.times(g)
    return i
}

export let distribute_exp_sum_inv = function <a, b, c>(): Fun<Prod<Fun<a, c>, Fun<b, c>>, Fun<Plus<a, b>, c>> {
    let j3: Fun<Sum<Prod<Fun<a, c>, a>, Prod<Fun<b, c>, b>>, c> =
        apply_pair<a, c>().plus(apply_pair<b, c>())
    let j2: Fun<Sum<Prod<Prod<Fun<a, c>, Fun<b, c>>, a>, Prod<Prod<Fun<a, c>, Fun<b, c>>, b>>, Sum<Prod<Fun<a, c>, a>, Prod<Fun<b, c>, b>>> =
        (fst<Fun<a, c>, Fun<b, c>>().map_times(id<a>())).map_plus(snd<Fun<a, c>, Fun<b, c>>().map_times(id<b>()))
    let j1: Fun<Prod<Prod<Fun<a, c>, Fun<b, c>>, Sum<a, b>>, Sum<Prod<Prod<Fun<a, c>, Fun<b, c>>, a>, Prod<Prod<Fun<a, c>, Fun<b, c>>, b>>> =
        distribute_sum_prod<Prod<Fun<a, c>, Fun<b, c>>, a, b>()
    let j = curry(j1.then(j2).then(j3))
    return j
}

export let distribute_exp_prod = function <a, b, c>(): Fun<Fun<a, Fun<b, c>>, Fun<Prod<a, b>, c>> {
    return fun(f => uncurry(f))
}

export let distribute_exp_prod_inv = function <a, b, c>(): Fun<Fun<Prod<a, b>, c>, Fun<a, Fun<b, c>>> {
    return fun(f => curry(f))
}

// a^0 = 1
export let power_of_zero = function <a>(): Fun<Fun<Zero, a>, Unit> {
    return unit()
}

export let power_of_zero_inv = function <a>(): Fun<Unit, Fun<Zero, a>> {
    return curry(absurd<a>().after(snd<Unit, Zero>()))
}

// c^b^a = c^a^b
export let swap_exp_args = function <a, b, c>(): Fun<Fun<a, Fun<b, c>>, Fun<b, Fun<a, c>>> {
    let j1 = id<Fun<a, Fun<b, c>>>().map_times(swap_prod<b, a>())
    let j2 = distribute_exp_prod<a, b, c>().map_times(id<Prod<a, b>>())
    let j3 = apply_pair<Prod<a, b>, c>()
    let j = j1.then(j2).then(j3)
    let i = curry(j).then(distribute_exp_prod_inv())

    return i
}

// a*b = b*a
export let swap_prod = function <a, b>(): Fun<Prod<a, b>, Prod<b, a>> {
    return snd<a, b>().times(fst<a, b>())
}
// a+b = b+a
export let swap_sum = function <a, b>(): Fun<Sum<a, b>, Sum<b, a>> { return inr<b, a>().plus(inl<b, a>()) }

// _*c
let map_times_left = function <a, b, c>(): Fun<Fun<a, b>, Fun<Prod<a, c>, Prod<b, c>>> {
    let f = fst<Fun<a, b>, Prod<a, c>>().times(snd<Fun<a, b>, Prod<a, c>>().then(fst())).then(apply_pair())
    let g = snd<Fun<a, b>, Prod<a, c>>().then(snd())
    return curry(f.times(g))
}

// c*_
export let map_times_right = function <a, b, c>(): Fun<Fun<a, b>, Fun<Prod<c, a>, Prod<c, b>>> {
    let f = fst<Fun<a, b>, Prod<c, a>>().times(snd<Fun<a, b>, Prod<c, a>>().then(snd())).then(apply_pair())
    let g = snd<Fun<a, b>, Prod<c, a>>().then(fst())
    let h = (g.times(f))
    return curry(h)
}


export let lazy = function <a, b>(x: Fun<a, b>): Fun<Unit, Fun<a, b>> { return curry((id<Unit>().map_times(x)).then(snd<Unit, b>())) }

export let compose_pair = function <a, b, c>(): Fun<Prod<Fun<a, b>, Fun<b, c>>, Fun<a, c>> {
    let f = fst<Fun<a, b>, Fun<b, c>>().map_times(id<a>()).then(apply_pair())
    let g = fst<Prod<Fun<a, b>, Fun<b, c>>, a>().then(snd())
    return curry(g.times(f).then(apply_pair()))
}

// a = a^1
export let lazy_value = function <a>(): Fun<a, Fun<Unit, a>> {
    return curry(fst<a, Unit>())
}

// a^1 = a
export let eager_value = function <a>(): Fun<Fun<Unit, a>, a> {
    return id<Fun<Unit, a>>().times(unit<Fun<Unit, a>>()).then(apply_pair())
}

// a*1 = a
export let product_identity = function <a>(): Fun<Prod<a, Unit>, a> {
    return fst<a, Unit>()
}

// a = a*1
export let product_identity_inv = function <a>(): Fun<a, Prod<a, Unit>> {
    return id<a>().times(unit<a>())
}

// a+0 = a
export let sum_identity = function <a>(): Fun<Sum<a, Zero>, a> {
    return id<a>().plus(absurd<a>())
}

// a = a+0
export let sum_identity_inv = function <a>(): Fun<a, Sum<a, Zero>> {
    return inl<a, Zero>()
}

export let plus_cat = function <a, b, c>(): Fun<Prod<Fun<a, c>, Fun<b, c>>, Fun<Sum<a, b>, c>> {
    return fun2((f: Fun<a, c>, g: Fun<b, c>) => f.plus(g))
}

export let plus_par_cat = function <a, b, c, d>(): Fun<Prod<Fun<a, c>, Fun<b, d>>, Fun<Sum<a, b>, Sum<c, d>>> {
    return fun2((f: Fun<a, c>, g: Fun<b, d>) => f.map_plus(g))
}

// a*a = a^2
export let prod_to_fun = function <a>(): Fun<Prod<a, a>, Fun<Sum<Unit, Unit>, a>> {
    let j1: Fun<Sum<Prod<Prod<a, a>, Unit>, Prod<Prod<a, a>, Unit>>, a> = (fst<Prod<a, a>, Unit>().then(fst())).plus(fst<Prod<a, a>, Unit>().then(snd()))
    let j: Fun<Prod<Prod<a, a>, Sum<Unit, Unit>>, a> = distribute_sum_prod<Prod<a, a>, Unit, Unit>().then(j1)
    let i = curry(j)
    return i
}

// a^2 = a*a
export let prod_from_fun = function <a>(): Fun<Fun<Sum<Unit, Unit>, a>, Prod<a, a>> {
    let f1 = id<Fun<Sum<Unit, Unit>, a>>().times(unit<Fun<Sum<Unit, Unit>, a>>().then(inl<Unit, Unit>())).then(apply_pair())
    let f2 = id<Fun<Sum<Unit, Unit>, a>>().times(unit<Fun<Sum<Unit, Unit>, a>>().then(inr<Unit, Unit>())).then(apply_pair())
    return f1.times(f2)
}

// a*0 = 0
export let times_zero = function <a>(): Fun<Prod<a, Zero>, Zero> {
    return snd<a, Zero>()
}

export let times_zero_inv = function <a>(): Fun<Zero, Prod<a, Zero>> {
    return absurd<a>().times(id<Zero>())
}