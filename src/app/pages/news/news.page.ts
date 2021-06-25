import { Component, OnInit } from '@angular/core';
import { NewsService } from 'src/app/services/news.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage implements OnInit {
  articles:any;
  constructor(private newService:NewsService) { }

  ngOnInit() {
    this.loadNews()
  }
  loadNews(){
    this.newService.getNews("top-headlines?country=us").subscribe(news=>{
      this.articles=news['articles'];
      console.log(this.articles)
    })
  }

}
