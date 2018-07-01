<div class="works">
	<%=include('header_bw',{title:"WORKS",back_url:"/"})%>
	<article>
		<%for(let i=0,l=self.works.length,w;i<l&&(w=self.works[i]);i++){%>
			<section>
			<a href="<%=w.id%>">
				<h2><%=w.title%></h2>
				<p><%=w.desc%></p>
				<ul class="taglist">
					<%for(let j=0,l=w.tag.length;j<l;j++){%><li><%=w.tag[j]%></li><%}%>
				</ul>
			</a>
			</section>
		<%}%>
	</article>
</div>