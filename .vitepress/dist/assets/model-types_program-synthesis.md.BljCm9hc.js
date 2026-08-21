import{_ as a,o as n,c as e,a2 as p}from"./chunks/framework.mRCPFc5l.js";const u=JSON.parse('{"title":"Program Synthesis","description":"","frontmatter":{"title":"Program Synthesis"},"headers":[],"relativePath":"model-types/program-synthesis.md","filePath":"model-types/program-synthesis.md"}'),l={name:"model-types/program-synthesis.md"};function t(i,s,o,c,d,r){return n(),e("div",null,[...s[0]||(s[0]=[p(`<h1 id="program-synthesis" tabindex="-1">Program Synthesis <a class="header-anchor" href="#program-synthesis" aria-label="Permalink to &quot;Program Synthesis&quot;">​</a></h1><p>Program synthesis inverts the normal modeling question. Instead of asking <em>&quot;does this sequence of operations violate a property?&quot;</em>, you ask <em>&quot;what sequence of operations satisfies this property?&quot;</em></p><p>You define a goal using <code>assume</code>, leave some steps unspecified using <code>__</code> (synthesis slots), and let the solver figure out which operations to call and in what order.</p><p><strong>Use program synthesis when:</strong></p><ul><li>You want the solver to find a sequence of operations that achieves a target state</li><li>You are exploring what workflows are even possible given your model&#39;s constraints</li><li>You want to verify that a goal is achievable at all (or find that it isn&#39;t)</li></ul><hr><h2 id="the-synthesis-slot" tabindex="-1">The <code>__</code> Synthesis Slot <a class="header-anchor" href="#the-synthesis-slot" aria-label="Permalink to &quot;The \`__\` Synthesis Slot&quot;">​</a></h2><p>A <code>__</code> in the run block is a placeholder. The solver picks which flow function to call at that step. Each slot is independent — the solver can choose a different function for each <code>__</code>.</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>run init {</span></span>
<span class="line"><span>    inst = new myFlow;</span></span>
<span class="line"><span>} {</span></span>
<span class="line"><span>    __;</span></span>
<span class="line"><span>    __;</span></span>
<span class="line"><span>    __;</span></span>
<span class="line"><span>};</span></span></code></pre></div><p>You can mix explicit steps with synthesis slots:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>run init {</span></span>
<span class="line"><span>    inst = new account;</span></span>
<span class="line"><span>} {</span></span>
<span class="line"><span>    inst.deposit;   // always deposit first</span></span>
<span class="line"><span>    __;             // solver picks what happens next</span></span>
<span class="line"><span>    __;</span></span>
<span class="line"><span>};</span></span></code></pre></div><hr><h2 id="goals-assume-instead-of-assert" tabindex="-1">Goals: <code>assume</code> Instead of <code>assert</code> <a class="header-anchor" href="#goals-assume-instead-of-assert" aria-label="Permalink to &quot;Goals: \`assume\` Instead of \`assert\`&quot;">​</a></h2><p>In a normal model, <code>assert</code> asks the solver to find a counterexample. In synthesis mode, you use <code>assume</code> to express the goal — the solver finds a scenario <em>where the assumption holds</em>.</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>assume counter.value &gt; 10 eventually;</span></span></code></pre></div><p>This tells the solver: fill in the <code>__</code> slots with operations such that <code>counter.value</code> eventually exceeds 10.</p><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>Do not use <code>assert</code> as a synthesis goal. <code>assert</code> looks for violations. <code>assume</code> restricts the solution space to scenarios where the condition holds — which is what synthesis needs.</p></div><hr><h2 id="worked-example-finding-a-deposit-sequence" tabindex="-1">Worked Example: Finding a Deposit Sequence <a class="header-anchor" href="#worked-example-finding-a-deposit-sequence" aria-label="Permalink to &quot;Worked Example: Finding a Deposit Sequence&quot;">​</a></h2><p>A bank account has <code>deposit</code>, <code>withdraw</code>, and <code>bonus</code> operations. We want to find a sequence of five operations that results in a balance over 100, starting from 50.</p><h3 id="the-spec" tabindex="-1">The Spec <a class="header-anchor" href="#the-spec" aria-label="Permalink to &quot;The Spec&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>spec account;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>def wallet = stock{</span></span>
<span class="line"><span>    balance: 50,</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>def ops = flow{</span></span>
<span class="line"><span>    w: new wallet,</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    deposit: func{</span></span>
<span class="line"><span>        w.balance &lt;- 20;</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    withdraw: func{</span></span>
<span class="line"><span>        if w.balance &gt; 10 {</span></span>
<span class="line"><span>            w.balance -&gt; 10;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    bonus: func{</span></span>
<span class="line"><span>        if w.balance &gt; 50 {</span></span>
<span class="line"><span>            w.balance &lt;- 5;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>assume wallet.balance &gt; 100 eventually;</span></span>
<span class="line"><span>assume wallet.balance &gt;= 0 always;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>run init {</span></span>
<span class="line"><span>    acct = new ops;</span></span>
<span class="line"><span>} {</span></span>
<span class="line"><span>    __;</span></span>
<span class="line"><span>    __;</span></span>
<span class="line"><span>    __;</span></span>
<span class="line"><span>    __;</span></span>
<span class="line"><span>    __;</span></span>
<span class="line"><span>};</span></span></code></pre></div><p>The solver will find a sequence of five operations — chosen from <code>deposit</code>, <code>withdraw</code>, and <code>bonus</code> — that results in a balance above 100 while keeping it non-negative throughout.</p><h3 id="reading-the-output" tabindex="-1">Reading the Output <a class="header-anchor" href="#reading-the-output" aria-label="Permalink to &quot;Reading the Output&quot;">​</a></h3><p>The result trace shows which function was chosen at each step and the stock values after each round. For example:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Round 1: acct.deposit    — balance: 70</span></span>
<span class="line"><span>Round 2: acct.deposit    — balance: 90</span></span>
<span class="line"><span>Round 3: acct.bonus      — (guard fails, no change)</span></span>
<span class="line"><span>Round 4: acct.deposit    — balance: 110</span></span>
<span class="line"><span>Round 5: acct.withdraw   — balance: 100</span></span></code></pre></div><p>The solver found a valid path. If no path exists (the goal is unreachable in the given number of steps), the solver returns <code>unsat</code>.</p><hr><h2 id="unfunc-declarative-functions" tabindex="-1"><code>unfunc</code>: Declarative Functions <a class="header-anchor" href="#unfunc-declarative-functions" aria-label="Permalink to &quot;\`unfunc\`: Declarative Functions&quot;">​</a></h2><p><code>unfunc</code> is a declarative alternative to <code>func</code> for use with synthesis. Instead of imperative steps, you declare what a function <em>requires</em> and what it <em>emits</em>.</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>def ops = flow{</span></span>
<span class="line"><span>    w: new wallet,</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    deposit: unfunc{</span></span>
<span class="line"><span>        emits w.balance &lt;- 20,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    bonus: unfunc{</span></span>
<span class="line"><span>        requires w.balance &gt; 50,</span></span>
<span class="line"><span>        emits w.balance &lt;- 5,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>};</span></span></code></pre></div><p><code>requires</code> declares a precondition. The solver will only select this function when the precondition holds. <code>emits</code> declares the effect.</p><p>The <code>available</code> temporal qualifier pairs with <code>unfunc</code> to assert that a function starts in an available state:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>assume bonus available;</span></span></code></pre></div><p>This tells the solver the <code>bonus</code> function is available from the start (i.e., its precondition is satisfiable from the initial state).</p><hr><h2 id="complete-example-with-unfunc" tabindex="-1">Complete Example with <code>unfunc</code> <a class="header-anchor" href="#complete-example-with-unfunc" aria-label="Permalink to &quot;Complete Example with \`unfunc\`&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>spec taskScheduler;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>def queue = stock{</span></span>
<span class="line"><span>    pending: 3,</span></span>
<span class="line"><span>    done: 0,</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>def scheduler = flow{</span></span>
<span class="line"><span>    q: new queue,</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    submit: unfunc{</span></span>
<span class="line"><span>        emits q.pending &lt;- 1,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    process: unfunc{</span></span>
<span class="line"><span>        requires q.pending &gt; 0,</span></span>
<span class="line"><span>        emits q.pending -&gt; 1,</span></span>
<span class="line"><span>        emits q.done &lt;- 1,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>assume queue.done &gt;= 5 eventually;</span></span>
<span class="line"><span>assume queue.pending &gt;= 0 always;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>run init {</span></span>
<span class="line"><span>    s = new scheduler;</span></span>
<span class="line"><span>} {</span></span>
<span class="line"><span>    __;</span></span>
<span class="line"><span>    __;</span></span>
<span class="line"><span>    __;</span></span>
<span class="line"><span>    __;</span></span>
<span class="line"><span>    __;</span></span>
<span class="line"><span>    __;</span></span>
<span class="line"><span>    __;</span></span>
<span class="line"><span>    __;</span></span>
<span class="line"><span>};</span></span></code></pre></div><p>The solver finds a sequence of <code>submit</code> and <code>process</code> calls that drains enough tasks to satisfy <code>queue.done &gt;= 5</code> while never going negative on <code>pending</code>.</p><hr><h2 id="key-concepts" tabindex="-1">Key Concepts <a class="header-anchor" href="#key-concepts" aria-label="Permalink to &quot;Key Concepts&quot;">​</a></h2><ul><li><strong><a href="./../language-reference/flows.html">Flows</a></strong> — flow and func syntax</li><li><strong><a href="./../invariants/assumptions.html">Invariants: Assumptions</a></strong> — using <code>assume</code> as synthesis goals</li><li><strong><a href="./../glossary/#synthesis-slot">Glossary: <code>__</code></a></strong> — synthesis slot reference</li><li><strong><a href="./../glossary/#unfunc">Glossary: <code>unfunc</code></a></strong> — declarative function reference</li></ul>`,42)])])}const g=a(l,[["render",t]]);export{u as __pageData,g as default};
