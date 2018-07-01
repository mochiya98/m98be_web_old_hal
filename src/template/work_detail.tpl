<div class="work_detail">
	<%=include('header_bw',{title:self.title})%>
	<article>
		<header>
			<h1><%=self.title%></h1>
			<p><%=self.desc%></p>
			<ul class="taglist">
				<%for(let i=0,l=self.tag.length;i<l;i++){%><li><%=self.tag[i]%></li><%}%>
			</ul>
			<ul class="urllist">
				<%for(let i=0,l=self.url.length;i<l;i++){%><li><a href="<%=self.url[i].url%>" target="_blank"><%=self.url[i].name%></a></li><%}%>
			</ul>
		</header>
		<section class="md">
			<%=self.contents%>
		</section>
	</article>
</div>