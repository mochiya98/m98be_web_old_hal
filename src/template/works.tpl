<div class="works">
	<%=include('header_bw',{title:"WORKS",back_url:"/"})%>
	<article>
		<%for(let i=0,l=self.works.length;i<l;i++){%>
			<section>
			<a href="<%=self.works[i].id%>">
				<h1><%=self.works[i].title%></h1>
				<p><%=self.works[i].desc%></p>
				<ul class="taglist">
					<%for(let j=0,l=self.works[i].tag.length;j<l;j++){%><li><%=self.works[i].tag[j]%></li><%}%>
				</ul>
			</a>
			</section>
		<%}%>
	</article>
	<footer>
		<p>(c)2018 YukimasaFunaoka</p>
	</footer>
</div>