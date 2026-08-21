import{_ as n,o as s,c as e,a2 as t}from"./chunks/framework.mRCPFc5l.js";const u=JSON.parse('{"title":"Components","description":"","frontmatter":{"title":"Components"},"headers":[],"relativePath":"language-reference/components.md","filePath":"language-reference/components.md"}'),i={name:"language-reference/components.md"};function p(l,a,o,c,r,h){return s(),e("div",null,[...a[0]||(a[0]=[t(`<h1 id="components" tabindex="-1">Components <a class="header-anchor" href="#components" aria-label="Permalink to &quot;Components&quot;">​</a></h1><p>We could breakup <a href="https://cloud.google.com/customers/repl-it/" target="_blank" rel="noreferrer">this architecture</a> into a bunch of different components but we decide to start with two: a cache and a container manager.</p><h2 id="container-manager" tabindex="-1">Container Manager <a class="header-anchor" href="#container-manager" aria-label="Permalink to &quot;Container Manager&quot;">​</a></h2><p>Let&#39;s focus on the container manager first. What are the potential states the container manager could be in?</p><p>Well first of all it could be idle, waiting for a request to come in.</p><p>But once a request comes in the first thing we expect it to do is pull the proper container from the container registry. Then it stands the container up. Then at some later point when the user is done with the repl, it shuts down the container.</p><p>So in Fault we define a component and give it those states</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>component containerMng = states{</span></span>
<span class="line"><span>    idle: sfunc{</span></span>
<span class="line"><span>       ...</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    pullContainer: sfunc{</span></span>
<span class="line"><span>        ...</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    standUpContainer: sfunc{</span></span>
<span class="line"><span>        ...</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    shutdownContainer: sfunc{</span></span>
<span class="line"><span>        ...</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>};</span></span></code></pre></div><p>The transitions between states are nice and orderly. We don&#39;t have any real forks in the road to contend with.</p><div class="language-mermaid vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">mermaid</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">stateDiagram</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	containerMng_idle --&gt; containerMng_pullContainer</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	containerMng_pullContainer --&gt; containerMng_standUpContainer</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	containerMng_standUpContainer --&gt; containerMng_shutdownContainer</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	containerMng_shutdownContainer --&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">containerMng_idle</span></span></code></pre></div><h2 id="cache" tabindex="-1">Cache <a class="header-anchor" href="#cache" aria-label="Permalink to &quot;Cache&quot;">​</a></h2><p>The cache sits in front of the container manager and routes requests to active containers it knows about or back to the container manager to create a new environment for the repl.</p><p>The cache too can be idle when no requests are coming in. When a request enters the system, the cache first checks to see if it knows an active container the request belongs to. If it does it returns the record and reroutes the request to the correct place. If it doesn&#39;t it passes the request back to the container manager and (eventually) creates a new record. Periodically it goes through all its records and cleans up the old ones.</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>component replCache = states{</span></span>
<span class="line"><span>    idle: sfunc{</span></span>
<span class="line"><span>       ...</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    lookupRecord: sfunc{</span></span>
<span class="line"><span>        ...</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    returnRecord: sfunc{</span></span>
<span class="line"><span>        ...</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    createRecord:sfunc{</span></span>
<span class="line"><span>        ...</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    expired: sfunc{</span></span>
<span class="line"><span>        ...</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>};</span></span></code></pre></div><h2 id="state-machine" tabindex="-1">State Machine <a class="header-anchor" href="#state-machine" aria-label="Permalink to &quot;State Machine&quot;">​</a></h2><p>While most single components can be drawn as state machines that loop back on themselves, our REPL&#39;s two components actually interact with each other. When the cache can&#39;t find a record of an active container it triggers a state change on the container manager. The container manager&#39;s response triggers a state change on the cache (storing the record).</p><p>If we want to visualize that exchange it might look something like this:</p><div class="language-mermaid vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">mermaid</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">stateDiagram</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">state replCache {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	replCache_idle --&gt; replCache_expired</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	replCache_idle --&gt; replCache_lookupRecord</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	replCache_expired --&gt; replCache_idle</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	replCache_createRecord --&gt; containerMng_pullContainer</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	replCache_returnRecord --&gt; replCache_idle</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	replCache_lookupRecord --&gt; replCache_returnRecord</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	replCache_lookupRecord --&gt; replCache_createRecord</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">state containerMng {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	containerMng_pullContainer --&gt; containerMng_standUpContainer</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="run-block" tabindex="-1">Run Block <a class="header-anchor" href="#run-block" aria-label="Permalink to &quot;Run Block&quot;">​</a></h2><p>To tell Fault which states the model starts from, use a <code>run</code> block. The <code>run</code> block specifies initial state for each component and the sequence of steps to verify:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>run {</span></span>
<span class="line"><span>    replCache.lookupRecord | containerMng.idle;</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="run-block-vs-default-execution" tabindex="-1">Run Block vs. Default Execution <a class="header-anchor" href="#run-block-vs-default-execution" aria-label="Permalink to &quot;Run Block vs. Default Execution&quot;">​</a></h2><p>If a <code>.fsystem</code> file does not have a run block, Fault will execute each component in the order they are defined. If you want Fault to go farther you can define a run block with the number of steps you need:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>run {</span></span>
<span class="line"><span>    Arrival | Processor;</span></span>
<span class="line"><span>    Arrival | Processor;</span></span>
<span class="line"><span>    Arrival | Processor;</span></span>
<span class="line"><span>    Arrival | Processor;</span></span>
<span class="line"><span>    Arrival | Processor;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>When you import <code>.fspec</code> files Fault ignores whatever run blocks they might have (but honors any defined invariants like assertions or assumptions). This allows you to treat specifications as subsystems that can run as stand alone models as well as pieces of a larger more complex system.</p>`,25)])])}const g=n(i,[["render",p]]);export{u as __pageData,g as default};
