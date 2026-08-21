import{_ as n,o as a,c as e,a2 as t}from"./chunks/framework.mRCPFc5l.js";const u=JSON.parse('{"title":"Stock-Flow Models","description":"","frontmatter":{"title":"Stock-Flow Models"},"headers":[],"relativePath":"model-types/stock-flow.md","filePath":"model-types/stock-flow.md"}'),l={name:"model-types/stock-flow.md"};function p(i,s,o,c,r,d){return a(),e("div",null,[...s[0]||(s[0]=[t(`<h1 id="stock-flow-models" tabindex="-1">Stock-Flow Models <a class="header-anchor" href="#stock-flow-models" aria-label="Permalink to &quot;Stock-Flow Models&quot;">​</a></h1><p>A stock-flow model is the right choice when you want to reason about <strong>resources that accumulate and drain over time</strong> — queues, pools, budgets, rate limits, memory, tokens. The core question is: <em>can the values of these resources reach a bad state?</em></p><p>Stock-flow models live in a single <code>.fspec</code> file. There is no state machine — just stocks, flows, assertions, and a run block that specifies the sequence of operations to verify.</p><p><strong>Use stock-flow models when:</strong></p><ul><li>You have numeric quantities that change over time</li><li>You want to find overflow, underflow, starvation, or exhaustion scenarios</li><li>You want to check that concurrent operations don&#39;t corrupt shared state</li></ul><hr><h2 id="worked-example-token-bucket-rate-limiter" tabindex="-1">Worked Example: Token Bucket Rate Limiter <a class="header-anchor" href="#worked-example-token-bucket-rate-limiter" aria-label="Permalink to &quot;Worked Example: Token Bucket Rate Limiter&quot;">​</a></h2><p>A token bucket rate limiter refills at a fixed rate and consumes one token per accepted request. We want to verify two properties:</p><ol><li>The bucket never goes negative (no over-consumption)</li><li>The bucket never exceeds capacity (no over-refill)</li></ol><h3 id="defining-the-stocks" tabindex="-1">Defining the Stocks <a class="header-anchor" href="#defining-the-stocks" aria-label="Permalink to &quot;Defining the Stocks&quot;">​</a></h3><p>Stocks represent the quantities we want to track. Here the bucket has a <code>tokens</code> count and a fixed <code>capacity</code>.</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>spec tokenBucket;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>def bucket = stock{</span></span>
<span class="line"><span>    tokens: 10,</span></span>
<span class="line"><span>    capacity: 10,</span></span>
<span class="line"><span>};</span></span></code></pre></div><p><code>tokens: 10</code> sets the starting value. The Fault compiler treats all numbers as reals internally, so integers and floats are interchangeable.</p><h3 id="defining-the-flows" tabindex="-1">Defining the Flows <a class="header-anchor" href="#defining-the-flows" aria-label="Permalink to &quot;Defining the Flows&quot;">​</a></h3><p>Flows define operations that change stock values. The <code>&lt;-</code> operator increments, <code>-&gt;</code> decrements.</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>def limiter = flow{</span></span>
<span class="line"><span>    b: new bucket,</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    refill: func{</span></span>
<span class="line"><span>        if b.tokens &lt; b.capacity {</span></span>
<span class="line"><span>            b.tokens &lt;- 1;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    consume: func{</span></span>
<span class="line"><span>        if b.tokens &gt; 0 {</span></span>
<span class="line"><span>            b.tokens -&gt; 1;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>};</span></span></code></pre></div><p>The guard conditions (<code>if b.tokens &gt; 0</code>) constrain when each function can execute. Fault will still explore scenarios where the guard doesn&#39;t hold — the function just becomes a no-op in that path.</p><h3 id="writing-the-assertions" tabindex="-1">Writing the Assertions <a class="header-anchor" href="#writing-the-assertions" aria-label="Permalink to &quot;Writing the Assertions&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>assert bucket.tokens &gt;= 0;</span></span>
<span class="line"><span>assert bucket.tokens &lt;= bucket.capacity;</span></span></code></pre></div><p><code>assert</code> tells the solver to find a counterexample — a scenario where these properties are violated. If it finds one, the trace shows exactly which sequence of operations caused it.</p><h3 id="the-run-block" tabindex="-1">The Run Block <a class="header-anchor" href="#the-run-block" aria-label="Permalink to &quot;The Run Block&quot;">​</a></h3><p>The <code>run</code> block instantiates the flow and specifies the sequence of operations to verify. The <code>|</code> operator means the two functions can execute in either order — Fault explores both.</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>run init {</span></span>
<span class="line"><span>    rl = new limiter;</span></span>
<span class="line"><span>} {</span></span>
<span class="line"><span>    rl.refill | rl.consume;</span></span>
<span class="line"><span>    rl.refill | rl.consume;</span></span>
<span class="line"><span>    rl.refill | rl.consume;</span></span>
<span class="line"><span>    rl.refill | rl.consume;</span></span>
<span class="line"><span>    rl.refill | rl.consume;</span></span>
<span class="line"><span>};</span></span></code></pre></div><p>Five rounds, each with a non-deterministic choice of whether to refill or consume first. Fault checks that both assertions hold across all possible orderings.</p><h3 id="complete-model" tabindex="-1">Complete Model <a class="header-anchor" href="#complete-model" aria-label="Permalink to &quot;Complete Model&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>spec tokenBucket;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>def bucket = stock{</span></span>
<span class="line"><span>    tokens: 10,</span></span>
<span class="line"><span>    capacity: 10,</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>def limiter = flow{</span></span>
<span class="line"><span>    b: new bucket,</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    refill: func{</span></span>
<span class="line"><span>        if b.tokens &lt; b.capacity {</span></span>
<span class="line"><span>            b.tokens &lt;- 1;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    consume: func{</span></span>
<span class="line"><span>        if b.tokens &gt; 0 {</span></span>
<span class="line"><span>            b.tokens -&gt; 1;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>assert bucket.tokens &gt;= 0;</span></span>
<span class="line"><span>assert bucket.tokens &lt;= bucket.capacity;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>run init {</span></span>
<span class="line"><span>    rl = new limiter;</span></span>
<span class="line"><span>} {</span></span>
<span class="line"><span>    rl.refill | rl.consume;</span></span>
<span class="line"><span>    rl.refill | rl.consume;</span></span>
<span class="line"><span>    rl.refill | rl.consume;</span></span>
<span class="line"><span>    rl.refill | rl.consume;</span></span>
<span class="line"><span>    rl.refill | rl.consume;</span></span>
<span class="line"><span>};</span></span></code></pre></div><hr><h2 id="making-it-more-interesting" tabindex="-1">Making It More Interesting <a class="header-anchor" href="#making-it-more-interesting" aria-label="Permalink to &quot;Making It More Interesting&quot;">​</a></h2><h3 id="unknown-starting-values" tabindex="-1">Unknown starting values <a class="header-anchor" href="#unknown-starting-values" aria-label="Permalink to &quot;Unknown starting values&quot;">​</a></h3><p>Replace fixed values with <code>unknown()</code> to let the solver pick starting conditions:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>def bucket = stock{</span></span>
<span class="line"><span>    tokens,           // solver picks any starting value</span></span>
<span class="line"><span>    capacity: 10,</span></span>
<span class="line"><span>};</span></span></code></pre></div><p>This will immediately surface the underflow case if the guard conditions are insufficient.</p><h3 id="testing-concurrent-producers-and-consumers" tabindex="-1">Testing concurrent producers and consumers <a class="header-anchor" href="#testing-concurrent-producers-and-consumers" aria-label="Permalink to &quot;Testing concurrent producers and consumers&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>run init {</span></span>
<span class="line"><span>    rl = new limiter;</span></span>
<span class="line"><span>} {</span></span>
<span class="line"><span>    rl.consume | rl.consume;</span></span>
<span class="line"><span>    rl.refill;</span></span>
<span class="line"><span>    rl.consume | rl.consume;</span></span>
<span class="line"><span>    rl.refill;</span></span>
<span class="line"><span>};</span></span></code></pre></div><p>Two simultaneous consumers each round — does the guard prevent the bucket from going negative even when two consumers race?</p><hr><h2 id="key-concepts" tabindex="-1">Key Concepts <a class="header-anchor" href="#key-concepts" aria-label="Permalink to &quot;Key Concepts&quot;">​</a></h2><ul><li><strong><a href="./../language-reference/stocks.html">Stocks</a></strong> — reservoirs of resources</li><li><strong><a href="./../language-reference/flows.html">Flows</a></strong> — operations that change stocks</li><li><strong><a href="./../data-types/">Data Types</a></strong> — numeric, boolean, unknown, uncertain, and more</li><li><strong><a href="./../invariants/">Invariants</a></strong> — assertions and temporal qualifiers</li></ul>`,38)])])}const k=n(l,[["render",p]]);export{u as __pageData,k as default};
