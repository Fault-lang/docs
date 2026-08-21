import{_ as s,o as a,c as n,a2 as t}from"./chunks/framework.mRCPFc5l.js";const u=JSON.parse('{"title":"Home","description":"","frontmatter":{"title":"Home"},"headers":[],"relativePath":"index.md","filePath":"index.md"}'),p={name:"index.md"};function o(i,e,l,c,h,r){return a(),n("div",null,[...e[0]||(e[0]=[t(`<pre class="fault-logo">███████████   █████████   █████  █████ █████       ███████████
░░███░░░░░░█  ███░░░░░███ ░░███  ░░███ ░░███       ░█░░░███░░░█
 ░███   █ ░  ░███    ░███  ░███   ░███  ░███       ░   ░███  ░
 ░███████    ░███████████  ░███   ░███  ░███           ░███
 ░███░░░█    ░███░░░░░███  ░███   ░███  ░███           ░███
 ░███  ░     ░███    ░███  ░███   ░███  ░███      █    ░███
 █████       █████   █████ ░░████████   ███████████    █████
 ░░░░░       ░░░░░   ░░░░░   ░░░░░░░░   ░░░░░░░░░░░    ░░░░░
</pre><p>Fault is a domain specific language for encoding models of systems into Satisfiability Modulo Theories (SMT). It was developed originally to apply formal verification techniques to system dynamic style models, but it can currently do much more than that.</p><p>Somethings to use Fault for:</p><ul><li>Modeling the behavior of a state machine</li><li>Making traditional boolean logic both machine executable AND human readable</li><li>Solving program synthesis problems</li><li>Explore the limits of control logic in feedback loops.</li></ul><h2 id="let-s-model-a-thing" tabindex="-1">Let&#39;s Model A Thing! <a class="header-anchor" href="#let-s-model-a-thing" aria-label="Permalink to &quot;Let&#39;s Model A Thing!&quot;">​</a></h2><p>The simpliest and easiest model to write in Fault is a state machine. Here&#39;s a circuit breaker — a pattern most engineers know well:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>system circuitBreaker;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>component breaker = states{</span></span>
<span class="line"><span>    closed: sfunc{</span></span>
<span class="line"><span>        advance(this.open) || stay();</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    open: sfunc{</span></span>
<span class="line"><span>        advance(this.halfOpen);</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    halfOpen: sfunc{</span></span>
<span class="line"><span>        advance(this.closed) || advance(this.open);</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>run {</span></span>
<span class="line"><span>    breaker.closed;</span></span>
<span class="line"><span>};</span></span></code></pre></div><p>This defines a component with three states and the transitions between them. Fault will explore every possible path through the state machine and verify that the behavior matches what you expect — for example, that <code>open</code> is always reachable from <code>closed</code>, or that the breaker can never get stuck.</p><p>Although Fault has a few distinct model types, you can actually import and attach one model to another, building out more complex behaviors. For example, you can attach <strong>stocks</strong> (reservoirs of resources) and <strong>flows</strong> (rates of change) to specify exactly <em>how</em> and <em>when</em> state transitions happen. The <a href="./language-reference/">Language Reference</a> section walks through a full example.</p><p>But first — let&#39;s look at stocks and flows on their own, since they&#39;re useful standalone too.</p><h2 id="stocks-and-flows-the-sandwich-problem" tabindex="-1">Stocks and Flows: The Sandwich Problem <a class="header-anchor" href="#stocks-and-flows-the-sandwich-problem" aria-label="Permalink to &quot;Stocks and Flows: The Sandwich Problem&quot;">​</a></h2><p>Let&#39;s suppose that we work at a startup with a free lunch policy. We have a certain number of employees and need a certain number of sandwiches each day. We don&#39;t want to run out of sandwiches and we don&#39;t want to have too many leftover sandwiches.</p><p>We don&#39;t need a complex model to solve this problem-- we can just get one sandwich per employee and call it a day. But this solution leaves a lot of potential edge cases that will cause our solution to fail. For example, what if some of our employees decide to take two sandwiches? What if a few decide to skip the free option and go out for lunch? What happens to the leftover sandwiches at the end of the day? Do we throw them out or do we let people eat them the following lunch, thereby gradually increasing our surplus?</p><p>At the time Fault was created there were tools to build models that simulated the outcomes of this type of system, but nothing that allowed you to formalize and check whether the algorithms we create to manage in-flows, out-flows and autoscaling would behavior correctly</p><p>If you wanted an absolute guarantee that your lunch service will never run out of sandwiches and will never have too many extras, you need to create a model that specifies how your process for doing lunch keeps those edge cases from happening.</p><p>Okay here&#39;s our model in Fault:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>spec sandwich;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>def supplies = stock{</span></span>
<span class="line"><span>    ham: 20,</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>def people = stock{</span></span>
<span class="line"><span>    num: 15,</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>def lunch = flow{</span></span>
<span class="line"><span>    sandwiches: new supplies,</span></span>
<span class="line"><span>    toFeed: new people,</span></span>
<span class="line"><span>    service: func{</span></span>
<span class="line"><span>        sandwiches.ham -&gt; toFeed.num; </span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    prep: func{</span></span>
<span class="line"><span>        if sandwiches.ham &lt; toFeed.num {</span></span>
<span class="line"><span>            sandwiches.ham &lt;- (toFeed.num - sandwiches.ham);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>assert supplies.ham &gt;= 0;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>run init{</span></span>
<span class="line"><span>    day = new lunch;</span></span>
<span class="line"><span>} {</span></span>
<span class="line"><span>    day.prep;</span></span>
<span class="line"><span>    day.service;</span></span>
<span class="line"><span>    day.prep;</span></span>
<span class="line"><span>    day.service;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>Let&#39;s break this down bit by bit.</p><p>The basic parts of the spec are <strong>stocks</strong> and <strong>flows</strong>. Stocks are collections of resources, in this case sandwiches and people.</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>def supplies = stock{</span></span>
<span class="line"><span>    ham: 20,</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>def people = stock{</span></span>
<span class="line"><span>    num: 15,</span></span>
<span class="line"><span>};</span></span></code></pre></div><p>Flows are functions that cause the amount of stocks to change. In our model we have two different ways our stock of sandwiches changes. First we prepare sandwiches for lunch, increasing their amount. Then we serve those sandwiches and people eat them 😃</p><p>To do this we attach an instance of the previous defined stocks to our flow with <code>new supplies</code> and <code>new people</code>.</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>def lunch = flow{</span></span>
<span class="line"><span>    sandwiches: new supplies,</span></span>
<span class="line"><span>    toFeed: new people,</span></span>
<span class="line"><span>    service: func{</span></span>
<span class="line"><span>        sandwiches.ham -&gt; toFeed.num; </span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    prep: func{</span></span>
<span class="line"><span>        if sandwiches.ham &lt; toFeed.num {</span></span>
<span class="line"><span>            sandwiches.ham &lt;- (toFeed.num - sandwiches.ham);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>};</span></span></code></pre></div><p>The <code>service</code> function is straight forward, we deduct enough sandwiches from out stock of sandwiches to feed the number of people we have.</p><p>The <code>prep</code> function has a bit more logic to it. If we have leftover sandwiches we don&#39;t want to waste them. So we will only make more sandwiches if we don&#39;t have enough for everyone and we will only make the number of sandwiches we need to feed everybody.</p><p>Like most model checkers, Fault uses <strong>bounded model checking</strong> which means that Fault will only &quot;run&quot; the model for a fixed number of steps. It will not check an infinite amount of time.</p><p>But it also shouldn&#39;t have to! You&#39;ll see why in a minute.</p><p>The <strong>run block</strong> defines what happens at each step. Each line is one round of execution.</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>run init {</span></span>
<span class="line"><span>    day = new lunch;</span></span>
<span class="line"><span>} {</span></span>
<span class="line"><span>    day.prep;</span></span>
<span class="line"><span>    day.service;</span></span>
<span class="line"><span>    day.prep;</span></span>
<span class="line"><span>    day.service;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>Here we initialize a flow with stocks attached in the <code>init</code> section, then list the steps Fault should execute — first prep, then service, repeated for two days. Each line is one round.</p><p>When Fault runs the model, it isn&#39;t actually evaluating any code. Instead it compiles to SMT and feeds the model into a SMT solver. The solver explores all possible branches of the behavior. If we&#39;ve written asserts, the solver will try to prove our assertions wrong (more on this later)</p><p>We start off with 20 sandwiches and Fault says in the first step of the model we have two scenarios: either we have 20 sandwiches or we have 15 sandwiches.</p><p>You&#39;re probably wondering why we would have 15 sandwiches at any point in the first round. It&#39;s because the first thing we do in round 1 is prepare sandwiches for lunch that day and the way we&#39;ve defined that process is as follows:</p><p><em>If the number of sandwiches is less than the number of people, add difference between sandwiches and people</em></p><p>But Fault will explore both the scenario where the conditional is true and the scenario where it is false. It doesn&#39;t evaluate the conditional, it neither knows nor cares if the conditional is true. It just creates a rule in SMT that says if the conditional IS true than the number of sandwiches should be increased by the number of people less the sandwiches we have. Since in the first round we have MORE sandwiches than people that number is -5. 20 - 5 = 15 sandwiches. The solver then dismisses that value and selects the correct value of 20 for future steps.</p><p>So the way this plays out is that state 0 of the variable sandwich_day_sandwiches_ham is 20, state 1 (the conditional is true) is 15, state 2 (the conditional is false) is 20 and state 3 is a <em>phi value</em> where the solver selects either the true branch or the false branch. Written this way the model checker briefly peeks into other potential futures.</p><p>What&#39;s useful about looking at all possible scenarios in the model is that it allows us to consider what the system behavior would be if safety checks happened too late, if we&#39;ve created race conditions, if we don&#39;t get a response from a request ... all things that happen on real systems and sometimes cause problems.</p><p>There&#39;s one more part of our model we&#39;re going to add. We&#39;re going to tell Fault we believe it is impossible that we&#39;ll run out of sandwiches and ask it to prove us wrong.</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>assert supplies.ham &gt;= 0;</span></span></code></pre></div><p>Asserts allow us to focus the solvers attention on how our model affects specific properties (invariants). Our simple sandwich model doesn&#39;t have many potential states because the number of sandwiches and the number of people are both set upfront. As models grow more complex there will be scenarios where many potential values could be assigned to a variable and the solver needs to choose one and move on. In these cases running the solver again might produce a slightly different scenario. <a href="https://cacm.acm.org/magazines/2019/9/238969-alloy/fulltext" target="_blank" rel="noreferrer">Alloy</a> is a good example. Every run of the solver will produce a different result.</p><p>Because we&#39;ve done a good job with our first model, Fault is happy to tell us it can find no specific failure case where our assert is untrue. But we don&#39;t need a model checker to tell us the 20 sandwiches is enough to feed 15 people. It would be better if we got rid of the magic numbers</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>def supplies = stock{</span></span>
<span class="line"><span>    ham,</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>def people = stock{</span></span>
<span class="line"><span>    num,</span></span>
<span class="line"><span>};</span></span></code></pre></div><p>This will define both the number of sandwiches and the number of people as <code>unknown</code> and Fault will attempt to solve for the values that will make our assert untrue. We can also define a variable as unknown explicitly with <code>num: unknown()</code></p><p>To ensure Fault encodes variables with the right type, it&#39;s a good idea to declare <code>unknown</code> with a type hint: <code>num: unknown(0)</code> or <code>num: unknown(0.0)</code> or <code>num: unknown(false)</code> This will not assign a starting value (after all the whole point is the starting value is <em>unknown</em>)</p><p>Now Fault tells us that -1 sandwiches and 0.125 people will create a scenario where we do not have enough sandwiches for everyone</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Start model, run for 4 rounds</span></span>
<span class="line"><span>-----------------------------------</span></span>
<span class="line"><span>   Resolving variable sandwich_day_sandwiches_ham to value -1.0</span></span>
<span class="line"><span>   Resolving variable sandwich_day_toFeed_num to value 0.125000</span></span>
<span class="line"><span>   Run function sandwich_day_prep (round 1)</span></span>
<span class="line"><span>      sandwich_day_sandwiches_ham: -1.0 → 0.125000</span></span>
<span class="line"><span>   Run function sandwich_day_service (round 2)</span></span>
<span class="line"><span>      sandwich_day_sandwiches_ham: 0.125000 → 0.0</span></span>
<span class="line"><span>   Run function sandwich_day_prep (round 3)</span></span>
<span class="line"><span>      Variable sandwich_day_sandwiches_ham is still 0.0</span></span>
<span class="line"><span>   Run function sandwich_day_service (round 4)</span></span>
<span class="line"><span>      Variable sandwich_day_sandwiches_ham is still 0.0</span></span></code></pre></div><p>That&#39;s still not super useful. So let&#39;s add a few assumptions to tell Fault to ignore negative values 😃</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>assume supplies.ham[0] &gt;= 0;</span></span>
<span class="line"><span>assume people.num &gt; 0;</span></span></code></pre></div><p>Since we <em>want</em> to find a scenario where we run out of sandwiches, we tell Fault that the <em>starting</em> value of <code>supplies.ham</code> cannot be less than zero and <strong>all</strong> values of <code>people.num</code> must be greater than zero.</p><p>This time, Fault can find no scenario where we run out of sandwiches.</p><h2 id="fault-philosophically" tabindex="-1">Fault Philosophically <a class="header-anchor" href="#fault-philosophically" aria-label="Permalink to &quot;Fault Philosophically&quot;">​</a></h2><p>Most languages for formal system specification are designed to prove system properties correct. But since the learning curve for writing models in these languages is so steep, when the beginner receives a positive result (no failure cases) it is almost certainly because they haven&#39;t written the model correctly. This creates a weird and frustrating experience where new users can&#39;t trust their success and can&#39;t appreciate their progresss.</p><p>Fault can be used in this way if you want, but that&#39;s not what it is built for. Fault is based on the assumption that ALL systems fail eventually. The purpose of a specification written in Fault is to explore the conditions under which the system might fail.</p>`,53)])])}const w=s(p,[["render",o]]);export{u as __pageData,w as default};
