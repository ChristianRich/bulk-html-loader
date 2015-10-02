var Loader = require('../lib/BulkHtmlLoader');

/**
 * Let's load 500 urls and open a lot of concurrent connections
 * In this example all of the loaded domains are different, so we could potentially open 1000 connections at a time - which would be unwise if all 500 urls sat on the same domain!
 * In a real world example below urls would be digested from a feed or external source and then added to the loader using a loop
 */
var queue = [
    new Loader.LoaderItem('http://www.facebook.com'),
    new Loader.LoaderItem('http://www.yahoo.com'),
    new Loader.LoaderItem('http://www.live.com'),
    new Loader.LoaderItem('http://www.wikipedia.org'),
    new Loader.LoaderItem('http://www.msn.com'),
    new Loader.LoaderItem('http://www.microsoft.com'),
    new Loader.LoaderItem('http://www.blogspot.com'),
    new Loader.LoaderItem('http://www.baidu.com'),
    new Loader.LoaderItem('http://www.qq.com'),
    new Loader.LoaderItem('http://www.mozilla.com'),
    new Loader.LoaderItem('http://www.sina.com.cn'),
    new Loader.LoaderItem('http://www.wordpress.com'),
    new Loader.LoaderItem('http://www.bing.com'),
    new Loader.LoaderItem('http://www.adobe.com'),
    new Loader.LoaderItem('http://www.163.com'),
    new Loader.LoaderItem('http://www.taobao.com'),
    new Loader.LoaderItem('http://www.soso.com'),
    new Loader.LoaderItem('http://www.twitter.com'),
    new Loader.LoaderItem('http://www.youku.com'),
    new Loader.LoaderItem('http://www.ask.com'),
    new Loader.LoaderItem('http://www.sohu.com'),
    new Loader.LoaderItem('http://www.amazon.com'),
    new Loader.LoaderItem('http://www.windows.com'),
    new Loader.LoaderItem('http://www.ebay.com'),
    new Loader.LoaderItem('http://www.yahoo.co.jp'),
    new Loader.LoaderItem('http://www.myspace.com'),
    new Loader.LoaderItem('http://www.apple.com'),
    new Loader.LoaderItem('http://www.tudou.com'),
    new Loader.LoaderItem('http://www.conduit.com'),
    new Loader.LoaderItem('http://www.hotmail.com'),
    new Loader.LoaderItem('http://www.flickr.com'),
    new Loader.LoaderItem('http://www.photobucket.com'),
    new Loader.LoaderItem('http://www.tianya.cn'),
    new Loader.LoaderItem('http://www.about.com'),
    new Loader.LoaderItem('http://www.cnet.com'),
    new Loader.LoaderItem('http://www.hao123.com'),
    new Loader.LoaderItem('http://www.iefxz.com'),
    new Loader.LoaderItem('http://www.xunlei.com'),
    new Loader.LoaderItem('http://www.paypal.com'),
    new Loader.LoaderItem('http://www.rapidshare.com'),
    new Loader.LoaderItem('http://www.go.com'),
    new Loader.LoaderItem('http://www.fc2.com'),
    new Loader.LoaderItem('http://www.bbc.co.uk'),
    new Loader.LoaderItem('http://www.imdb.com'),
    new Loader.LoaderItem('http://www.orkut.com'),
    new Loader.LoaderItem('http://www.sogou.com'),
    new Loader.LoaderItem('http://www.56.com'),
    new Loader.LoaderItem('http://www.aol.com'),
    new Loader.LoaderItem('http://www.craigslist.org'),
    new Loader.LoaderItem('http://www.rakuten.co.jp'),
    new Loader.LoaderItem('http://www.imageshack.us'),
    new Loader.LoaderItem('http://www.ku6.com'),
    new Loader.LoaderItem('http://www.blogger.com'),
    new Loader.LoaderItem('http://www.goo.ne.jp'),
    new Loader.LoaderItem('http://www.ifeng.com'),
    new Loader.LoaderItem('http://www.linkedin.com'),
    new Loader.LoaderItem('http://www.yandex.ru'),
    new Loader.LoaderItem('http://www.mail.ru'),
    new Loader.LoaderItem('http://www.partypoker.com'),
    new Loader.LoaderItem('http://www.megaupload.com'),
    new Loader.LoaderItem('http://www.answers.com'),
    new Loader.LoaderItem('http://www.alibaba.com'),
    new Loader.LoaderItem('http://www.hi5.com'),
    new Loader.LoaderItem('http://www.cnn.com'),
    new Loader.LoaderItem('http://www.amazon.co.jp'),
    new Loader.LoaderItem('http://www.4shared.com'),
    new Loader.LoaderItem('http://www.ameblo.jp'),
    new Loader.LoaderItem('http://www.gougou.com'),
    new Loader.LoaderItem('http://www.skype.com'),
    new Loader.LoaderItem('http://www.renren.com'),
    new Loader.LoaderItem('http://www.dailymotion.com'),
    new Loader.LoaderItem('http://www.naver.com'),
    new Loader.LoaderItem('http://www.weather.com'),
    new Loader.LoaderItem('http://www.mozilla.org'),
    new Loader.LoaderItem('http://www.mediafire.com'),
    new Loader.LoaderItem('http://www.bit.ly'),
    new Loader.LoaderItem('http://www.hp.com'),
    new Loader.LoaderItem('http://www.livedoor.jp'),
    new Loader.LoaderItem('http://www.ehow.com'),
    new Loader.LoaderItem('http://www.nifty.com'),
    new Loader.LoaderItem('http://www.vkontakte.ru'),
    new Loader.LoaderItem('http://www.alipay.com'),
    new Loader.LoaderItem('http://www.nytimes.com'),
    new Loader.LoaderItem('http://www.overture.com'),
    new Loader.LoaderItem('http://www.sourceforge.net'),
    new Loader.LoaderItem('http://www.fbcdn.net'),
    new Loader.LoaderItem('http://www.xtendmedia.com'),
    new Loader.LoaderItem('http://www.xinhuanet.com'),
    new Loader.LoaderItem('http://www.wikimedia.org'),
    new Loader.LoaderItem('http://www.pconline.com.cn'),
    new Loader.LoaderItem('http://www.daum.net'),
    new Loader.LoaderItem('http://www.4399.com'),
    new Loader.LoaderItem('http://www.bankofamerica.com'),
    new Loader.LoaderItem('http://www.ebay.de'),
    new Loader.LoaderItem('http://www.uol.com.br'),
    new Loader.LoaderItem('http://www.filestube.com'),
    new Loader.LoaderItem('http://www.zol.com.cn'),
    new Loader.LoaderItem('http://www.mop.com'),
    new Loader.LoaderItem('http://www.alexa.com'),
    new Loader.LoaderItem('http://www.biglobe.ne.jp'),
    new Loader.LoaderItem('http://www.brothersoft.com'),
    new Loader.LoaderItem('http://www.scribd.com'),
    new Loader.LoaderItem('http://www.softonic.com'),
    new Loader.LoaderItem('http://www.mapquest.com'),
    new Loader.LoaderItem('http://www.dell.com'),
    new Loader.LoaderItem('http://www.people.com.cn'),
    new Loader.LoaderItem('http://www.kaixin001.com'),
    new Loader.LoaderItem('http://www.geocities.jp'),
    new Loader.LoaderItem('http://www.ebay.co.uk'),
    new Loader.LoaderItem('http://www.hatena.ne.jp'),
    new Loader.LoaderItem('http://www.seesaa.net'),
    new Loader.LoaderItem('http://www.badoo.com'),
    new Loader.LoaderItem('http://www.megavideo.com'),
    new Loader.LoaderItem('http://www.126.com'),
    new Loader.LoaderItem('http://www.paipai.com'),
    new Loader.LoaderItem('http://www.avg.com'),
    new Loader.LoaderItem('http://www.pps.tv'),
    new Loader.LoaderItem('http://www.odnoklassniki.ru'),
    new Loader.LoaderItem('http://www.free.fr'),
    new Loader.LoaderItem('http://www.mywebsearch.com'),
    new Loader.LoaderItem('http://www.infoseek.co.jp'),
    new Loader.LoaderItem('http://www.zynga.com'),
    new Loader.LoaderItem('http://www.depositfiles.com'),
    new Loader.LoaderItem('http://www.metacafe.com'),
    new Loader.LoaderItem('http://www.chase.com'),
    new Loader.LoaderItem('http://www.thepiratebay.org'),
    new Loader.LoaderItem('http://www.kakaku.com'),
    new Loader.LoaderItem('http://www.cctv.com'),
    new Loader.LoaderItem('http://www.optmd.com'),
    new Loader.LoaderItem('http://www.hotfile.com'),
    new Loader.LoaderItem('http://www.com.com'),
    new Loader.LoaderItem('http://www.ning.com'),
    new Loader.LoaderItem('http://www.ocn.ne.jp'),
    new Loader.LoaderItem('http://www.vk.com'),
    new Loader.LoaderItem('http://www.game2.com.cn'),
    new Loader.LoaderItem('http://www.youdao.com'),
    new Loader.LoaderItem('http://www.getpersonas.com'),
    new Loader.LoaderItem('http://www.tripadvisor.com'),
    new Loader.LoaderItem('http://www.nate.com'),
    new Loader.LoaderItem('http://www.livejournal.com'),
    new Loader.LoaderItem('http://www.soufun.com'),
    new Loader.LoaderItem('http://www.zedo.com'),
    new Loader.LoaderItem('http://www.browserchoice.eu'),
    new Loader.LoaderItem('http://www.thefreedictionary.com'),
    new Loader.LoaderItem('http://www.2ch.net'),
    new Loader.LoaderItem('http://www.tinypic.com'),
    new Loader.LoaderItem('http://www.java.com'),
    new Loader.LoaderItem('http://www.narod.ru'),
    new Loader.LoaderItem('http://www.xici.net'),
    new Loader.LoaderItem('http://www.walmart.com'),
    new Loader.LoaderItem('http://www.114la.com'),
    new Loader.LoaderItem('http://www.joy.cn'),
    new Loader.LoaderItem('http://www.addthis.com'),
    new Loader.LoaderItem('http://www.globo.com'),
    new Loader.LoaderItem('http://www.360.cn'),
    new Loader.LoaderItem('http://www.cocolog-nifty.com'),
    new Loader.LoaderItem('http://www.netflix.com'),
    new Loader.LoaderItem('http://www.target.com'),
    new Loader.LoaderItem('http://www.58.com'),
    new Loader.LoaderItem('http://www.cyworld.com'),
    new Loader.LoaderItem('http://www.unionsky.cn'),
    new Loader.LoaderItem('http://www.tom.com'),
    new Loader.LoaderItem('http://www.amazon.de'),
    new Loader.LoaderItem('http://www.netlog.com'),
    new Loader.LoaderItem('http://www.amazon.co.uk'),
    new Loader.LoaderItem('http://www.reference.com'),
    new Loader.LoaderItem('http://www.douban.com'),
    new Loader.LoaderItem('http://www.eastmoney.com'),
    new Loader.LoaderItem('http://www.livedoor.com'),
    new Loader.LoaderItem('http://www.hexun.com'),
    new Loader.LoaderItem('http://www.liveperson.net'),
    new Loader.LoaderItem('http://www.7k7k.com'),
    new Loader.LoaderItem('http://www.miniclip.com'),
    new Loader.LoaderItem('http://www.so-net.ne.jp'),
    new Loader.LoaderItem('http://www.39.net'),
    new Loader.LoaderItem('http://www.nih.gov'),
    new Loader.LoaderItem('http://www.sakura.ne.jp'),
    new Loader.LoaderItem('http://www.rambler.ru'),
    new Loader.LoaderItem('http://www.reuters.com'),
    new Loader.LoaderItem('http://www.kugou.com'),
    new Loader.LoaderItem('http://www.mixi.jp'),
    new Loader.LoaderItem('http://www.terra.com.br'),
    new Loader.LoaderItem('http://www.tripod.com'),
    new Loader.LoaderItem('http://www.mcafee.com'),
    new Loader.LoaderItem('http://www.att.com'),
    new Loader.LoaderItem('http://www.weather.com.cn'),
    new Loader.LoaderItem('http://www.tagged.com'),
    new Loader.LoaderItem('http://www.2345.com'),
    new Loader.LoaderItem('http://www.zing.vn'),
    new Loader.LoaderItem('http://www.exblog.jp'),
    new Loader.LoaderItem('http://www.chinamobile.com'),
    new Loader.LoaderItem('http://www.expedia.com'),
    new Loader.LoaderItem('http://www.ameba.jp'),
    new Loader.LoaderItem('http://www.tinyurl.com'),
    new Loader.LoaderItem('http://www.chinanews.com.cn'),
    new Loader.LoaderItem('http://www.1stwebgame.com'),
    new Loader.LoaderItem('http://www.commentcamarche.net'),
    new Loader.LoaderItem('http://www.allabout.co.jp'),
    new Loader.LoaderItem('http://www.taringa.net'),
    new Loader.LoaderItem('http://www.nicovideo.jp'),
    new Loader.LoaderItem('http://www.domaintools.com'),
    new Loader.LoaderItem('http://www.jugem.jp'),
    new Loader.LoaderItem('http://www.excite.co.jp'),
    new Loader.LoaderItem('http://www.autohome.com.cn'),
    new Loader.LoaderItem('http://www.typepad.com'),
    new Loader.LoaderItem('http://www.ezinearticles.com'),
    new Loader.LoaderItem('http://www.shopping.com'),
    new Loader.LoaderItem('http://www.deviantart.com'),
    new Loader.LoaderItem('http://www.marketgid.com'),
    new Loader.LoaderItem('http://www.ikea.com'),
    new Loader.LoaderItem('http://www.yomiuri.co.jp'),
    new Loader.LoaderItem('http://www.maktoob.com'),
    new Loader.LoaderItem('http://www.web.de'),
    new Loader.LoaderItem('http://www.informharry.com'),
    new Loader.LoaderItem('http://www.alimama.com'),
    new Loader.LoaderItem('http://www.ynet.com'),
    new Loader.LoaderItem('http://www.softpedia.com'),
    new Loader.LoaderItem('http://www.china.com'),
    new Loader.LoaderItem('http://www.6.cn'),
    new Loader.LoaderItem('http://www.5599.net'),
    new Loader.LoaderItem('http://www.cntv.cn'),
    new Loader.LoaderItem('http://www.booking.com'),
    new Loader.LoaderItem('http://www.orange.fr'),
    new Loader.LoaderItem('http://www.advmaker.ru'),
    new Loader.LoaderItem('http://www.verycd.com'),
    new Loader.LoaderItem('http://www.multiply.com'),
    new Loader.LoaderItem('http://www.comcast.net'),
    new Loader.LoaderItem('http://www.ioage.com'),
    new Loader.LoaderItem('http://www.skycn.com'),
    new Loader.LoaderItem('http://www.libero.it'),
    new Loader.LoaderItem('http://www.onet.pl'),
    new Loader.LoaderItem('http://www.rediff.com'),
    new Loader.LoaderItem('http://www.americanexpress.com'),
    new Loader.LoaderItem('http://www.dailymail.co.uk'),
    new Loader.LoaderItem('http://www.alot.com'),
    new Loader.LoaderItem('http://www.nasza-klasa.pl'),
    new Loader.LoaderItem('http://www.pchome.net'),
    new Loader.LoaderItem('http://www.51job.com'),
    new Loader.LoaderItem('http://www.okwave.jp'),
    new Loader.LoaderItem('http://www.70yx.com'),
    new Loader.LoaderItem('http://www.rakuten.ne.jp'),
    new Loader.LoaderItem('http://www.nikkeibp.co.jp'),
    new Loader.LoaderItem('http://www.mlb.com'),
    new Loader.LoaderItem('http://www.huffingtonpost.com'),
    new Loader.LoaderItem('http://www.bestbuy.com'),
    new Loader.LoaderItem('http://www.freelotto.com'),
    new Loader.LoaderItem('http://www.yahoo.net'),
    new Loader.LoaderItem('http://www.docstoc.com'),
    new Loader.LoaderItem('http://www.csdn.net'),
    new Loader.LoaderItem('http://www.digg.com'),
    new Loader.LoaderItem('http://www.macromedia.com'),
    new Loader.LoaderItem('http://www.tumblr.com'),
    new Loader.LoaderItem('http://www.twitpic.com'),
    new Loader.LoaderItem('http://www.impress.co.jp'),
    new Loader.LoaderItem('http://www.foxsports.com'),
    new Loader.LoaderItem('http://www.wikia.com'),
    new Loader.LoaderItem('http://www.t-online.de'),
    new Loader.LoaderItem('http://www.verizonwireless.com'),
    new Loader.LoaderItem('http://www.justin.tv'),
    new Loader.LoaderItem('http://www.ups.com'),
    new Loader.LoaderItem('http://www.wp.pl'),
    new Loader.LoaderItem('http://www.docin.com'),
    new Loader.LoaderItem('http://www.pdfqueen.com'),
    new Loader.LoaderItem('http://www.dangdang.com'),
    new Loader.LoaderItem('http://www.focus.cn'),
    new Loader.LoaderItem('http://www.nextag.com'),
    new Loader.LoaderItem('http://www.ziddu.com'),
    new Loader.LoaderItem('http://www.hubpages.com'),
    new Loader.LoaderItem('http://www.kioskea.net'),
    new Loader.LoaderItem('http://www.babylon.com'),
    new Loader.LoaderItem('http://www.last.fm'),
    new Loader.LoaderItem('http://www.wellsfargo.com'),
    new Loader.LoaderItem('http://www.gmx.net'),
    new Loader.LoaderItem('http://www.friendster.com'),
    new Loader.LoaderItem('http://www.wsj.com'),
    new Loader.LoaderItem('http://www.slideshare.net'),
    new Loader.LoaderItem('http://www.foxnews.com'),
    new Loader.LoaderItem('http://www.ganji.com'),
    new Loader.LoaderItem('http://www.iza.ne.jp'),
    new Loader.LoaderItem('http://www.51.com'),
    new Loader.LoaderItem('http://www.metrolyrics.com'),
    new Loader.LoaderItem('http://www.yesky.com'),
    new Loader.LoaderItem('http://www.usps.com'),
    new Loader.LoaderItem('http://www.alisoft.com'),
    new Loader.LoaderItem('http://www.mainichi.jp'),
    new Loader.LoaderItem('http://www.irs.gov'),
    new Loader.LoaderItem('http://www.bigpoint.com'),
    new Loader.LoaderItem('http://www.china.com.cn'),
    new Loader.LoaderItem('http://www.iciba.com'),
    new Loader.LoaderItem('http://www.hulu.com'),
    new Loader.LoaderItem('http://www.gmarket.co.kr'),
    new Loader.LoaderItem('http://www.tabelog.com'),
    new Loader.LoaderItem('http://www.gamespot.com'),
    new Loader.LoaderItem('http://www.symantec.com'),
    new Loader.LoaderItem('http://www.nokia.com'),
    new Loader.LoaderItem('http://www.pcpop.com'),
    new Loader.LoaderItem('http://www.dion.ne.jp'),
    new Loader.LoaderItem('http://www.torrentz.com'),
    new Loader.LoaderItem('http://www.pptv.com'),
    new Loader.LoaderItem('http://www.telegraph.co.uk'),
    new Loader.LoaderItem('http://www.01net.com'),
    new Loader.LoaderItem('http://www.114la.com'),
    new Loader.LoaderItem('http://www.115.com'),
    new Loader.LoaderItem('http://www.118114.cn'),
    new Loader.LoaderItem('http://www.11st.co.kr'),
    new Loader.LoaderItem('http://www.120ask.com'),
    new Loader.LoaderItem('http://www.123people.com'),
    new Loader.LoaderItem('http://www.126.com'),
    new Loader.LoaderItem('http://www.159game.com'),
    new Loader.LoaderItem('http://www.163.com'),
    new Loader.LoaderItem('http://www.17173.com'),
    new Loader.LoaderItem('http://www.176.com'),
    new Loader.LoaderItem('http://www.19lou.com'),
    new Loader.LoaderItem('http://www.1link.ru'),
    new Loader.LoaderItem('http://www.1stwebgame.com'),
    new Loader.LoaderItem('http://www.1ting.com'),
    new Loader.LoaderItem('http://www.2000y.net'),
    new Loader.LoaderItem('http://www.21cn.com'),
    new Loader.LoaderItem('http://www.2345.com'),
    new Loader.LoaderItem('http://www.24h.com.vn'),
    new Loader.LoaderItem('http://www.265.com'),
    new Loader.LoaderItem('http://www.27.cn'),
    new Loader.LoaderItem('http://www.2ch.net'),
    new Loader.LoaderItem('http://www.360.cn'),
    new Loader.LoaderItem('http://www.360buy.com'),
    new Loader.LoaderItem('http://www.360doc.com'),
    new Loader.LoaderItem('http://www.37cs.com'),
    new Loader.LoaderItem('http://www.39.net'),
    new Loader.LoaderItem('http://www.4399.com'),
    new Loader.LoaderItem('http://www.47news.jp'),
    new Loader.LoaderItem('http://www.4shared.com'),
    new Loader.LoaderItem('http://www.51.com'),
    new Loader.LoaderItem('http://www.51fswd.com'),
    new Loader.LoaderItem('http://www.51job.com'),
    new Loader.LoaderItem('http://www.51mole.com'),
    new Loader.LoaderItem('http://www.51seer.com'),
    new Loader.LoaderItem('http://www.52pk.com'),
    new Loader.LoaderItem('http://www.5599.net'),
    new Loader.LoaderItem('http://www.56.com'),
    new Loader.LoaderItem('http://www.58.com'),
    new Loader.LoaderItem('http://www.5d6d.com'),
    new Loader.LoaderItem('http://www.6.cn'),
    new Loader.LoaderItem('http://www.61.com'),
    new Loader.LoaderItem('http://www.70yx.com'),
    new Loader.LoaderItem('http://www.7k7k.com'),
    new Loader.LoaderItem('http://www.8684.cn'),
    new Loader.LoaderItem('http://www.95599.cn'),
    new Loader.LoaderItem('http://www.9wee.com'),
    new Loader.LoaderItem('http://www.aa.com'),
    new Loader.LoaderItem('http://www.abchina.com'),
    new Loader.LoaderItem('http://www.about.com'),
    new Loader.LoaderItem('http://www.abril.com.br'),
    new Loader.LoaderItem('http://www.accountonline.com'),
    new Loader.LoaderItem('http://www.accuweather.com'),
    new Loader.LoaderItem('http://www.acer.com'),
    new Loader.LoaderItem('http://www.acrobat.com'),
    new Loader.LoaderItem('http://www.addictinggames.com'),
    new Loader.LoaderItem('http://www.addthis.com'),
    new Loader.LoaderItem('http://www.adobe.com'),
    new Loader.LoaderItem('http://www.advmaker.ru'),
    new Loader.LoaderItem('http://www.agame.com'),
    new Loader.LoaderItem('http://www.aibang.com'),
    new Loader.LoaderItem('http://www.alexa.com'),
    new Loader.LoaderItem('http://www.alibaba.com'),
    new Loader.LoaderItem('http://www.alice.it'),
    new Loader.LoaderItem('http://www.alimama.com'),
    new Loader.LoaderItem('http://www.alipay.com'),
    new Loader.LoaderItem('http://www.alisoft.com'),
    new Loader.LoaderItem('http://www.allabout.co.jp'),
    new Loader.LoaderItem('http://www.allegro.pl'),
    new Loader.LoaderItem('http://www.allexperts.com'),
    new Loader.LoaderItem('http://www.allocine.fr'),
    new Loader.LoaderItem('http://www.allrecipes.com'),
    new Loader.LoaderItem('http://www.alot.com'),
    new Loader.LoaderItem('http://www.altervista.org'),
    new Loader.LoaderItem('http://www.amazon.cn'),
    new Loader.LoaderItem('http://www.amazon.co.jp'),
    new Loader.LoaderItem('http://www.amazon.co.uk'),
    new Loader.LoaderItem('http://www.amazon.com'),
    new Loader.LoaderItem('http://www.amazon.de'),
    new Loader.LoaderItem('http://www.amazon.fr'),
    new Loader.LoaderItem('http://www.ameba.jp'),
    new Loader.LoaderItem('http://www.ameblo.jp'),
    new Loader.LoaderItem('http://www.americanexpress.com'),
    new Loader.LoaderItem('http://www.ana.co.jp'),
    new Loader.LoaderItem('http://www.ancestry.com'),
    new Loader.LoaderItem('http://www.angelfire.com'),
    new Loader.LoaderItem('http://www.answerbag.com'),
    new Loader.LoaderItem('http://www.answers.com'),
    new Loader.LoaderItem('http://www.aol.com'),
    new Loader.LoaderItem('http://www.aolnews.com'),
    new Loader.LoaderItem('http://www.apple.com'),
    new Loader.LoaderItem('http://www.appspot.com'),
    new Loader.LoaderItem('http://www.archive.org'),
    new Loader.LoaderItem('http://www.argos.co.uk'),
    new Loader.LoaderItem('http://www.armorgames.com'),
    new Loader.LoaderItem('http://www.articlesbase.com'),
    new Loader.LoaderItem('http://www.asahi-net.or.jp'),
    new Loader.LoaderItem('http://www.asahi.com'),
    new Loader.LoaderItem('http://www.asiae.co.kr'),
    new Loader.LoaderItem('http://www.ask.com'),
    new Loader.LoaderItem('http://www.associatedcontent.com'),
    new Loader.LoaderItem('http://www.att.com'),
    new Loader.LoaderItem('http://www.atwiki.jp'),
    new Loader.LoaderItem('http://www.auction.co.kr'),
    new Loader.LoaderItem('http://www.aufeminin.com'),
    new Loader.LoaderItem('http://www.autohome.com.cn'),
    new Loader.LoaderItem('http://www.autoscout24.de'),
    new Loader.LoaderItem('http://www.autotrader.com'),
    new Loader.LoaderItem('http://www.avast.com'),
    new Loader.LoaderItem('http://www.avg.com'),
    new Loader.LoaderItem('http://www.aweber.com'),
    new Loader.LoaderItem('http://www.azlyrics.com'),
    new Loader.LoaderItem('http://www.babycenter.com'),
    new Loader.LoaderItem('http://www.babylon.com'),
    new Loader.LoaderItem('http://www.badoo.com'),
    new Loader.LoaderItem('http://www.bahn.de'),
    new Loader.LoaderItem('http://www.baidu.com'),
    new Loader.LoaderItem('http://www.baixaki.com.br'),
    new Loader.LoaderItem('http://www.baixing.com'),
    new Loader.LoaderItem('http://www.bandoo.com'),
    new Loader.LoaderItem('http://www.bankofamerica.com'),
    new Loader.LoaderItem('http://www.baofeng.com'),
    new Loader.LoaderItem('http://www.barbie.com'),
    new Loader.LoaderItem('http://www.barnesandnoble.com'),
    new Loader.LoaderItem('http://www.bbc.co.uk'),
    new Loader.LoaderItem('http://www.bdr130.net'),
    new Loader.LoaderItem('http://www.bearshare.com'),
    new Loader.LoaderItem('http://www.bebo.com'),
    new Loader.LoaderItem('http://www.beemp3.com'),
    new Loader.LoaderItem('http://www.best-price.com'),
    new Loader.LoaderItem('http://www.bestbuy.com'),
    new Loader.LoaderItem('http://www.bidders.co.jp'),
    new Loader.LoaderItem('http://www.bigfishgames.com'),
    new Loader.LoaderItem('http://www.biglobe.ne.jp'),
    new Loader.LoaderItem('http://www.bigpoint.com'),
    new Loader.LoaderItem('http://www.bild.de'),
    new Loader.LoaderItem('http://www.bin-layer.de'),
    new Loader.LoaderItem('http://www.bing.com'),
    new Loader.LoaderItem('http://www.bit.ly'),
    new Loader.LoaderItem('http://www.bitauto.com'),
    new Loader.LoaderItem('http://www.bizrate.com'),
    new Loader.LoaderItem('http://www.blackberry.com'),
    new Loader.LoaderItem('http://www.blogbus.com'),
    new Loader.LoaderItem('http://www.blogcu.com'),
    new Loader.LoaderItem('http://www.blogger.com'),
    new Loader.LoaderItem('http://www.blogmura.com'),
    new Loader.LoaderItem('http://www.blogspot.com'),
    new Loader.LoaderItem('http://www.bloomberg.com'),
    new Loader.LoaderItem('http://www.blurtit.com'),
    new Loader.LoaderItem('http://www.boc.cn'),
    new Loader.LoaderItem('http://www.bohelady.com'),
    new Loader.LoaderItem('http://www.bomb-mp3.com'),
    new Loader.LoaderItem('http://www.booking.com'),
    new Loader.LoaderItem('http://www.boosj.com'),
    new Loader.LoaderItem('http://www.boston.com'),
    new Loader.LoaderItem('http://www.break.com'),
    new Loader.LoaderItem('http://www.brothersoft.com'),
    new Loader.LoaderItem('http://www.browserchoice.eu'),
    new Loader.LoaderItem('http://www.btjunkie.org'),
    new Loader.LoaderItem('http://www.businessweek.com'),
    new Loader.LoaderItem('http://www.buy.com'),
    new Loader.LoaderItem('http://www.buzzle.com'),
    new Loader.LoaderItem('http://www.buzznet.com'),
    new Loader.LoaderItem('http://www.ca.gov'),
    new Loader.LoaderItem('http://www.capitalone.com'),
    new Loader.LoaderItem('http://www.careerbuilder.com'),
    new Loader.LoaderItem('http://www.cartoonnetwork.com'),
    new Loader.LoaderItem('http://www.carview.co.jp'),
    new Loader.LoaderItem('http://www.causes.com'),
    new Loader.LoaderItem('http://www.cbsnews.com'),
    new Loader.LoaderItem('http://www.ccb.com.cn'),
    new Loader.LoaderItem('http://www.ccbill.com'),
    new Loader.LoaderItem('http://www.cctv.com'),
    new Loader.LoaderItem('http://www.ce.cn'),
    new Loader.LoaderItem('http://www.changyou.com'),
    new Loader.LoaderItem('http://www.chase.com'),
    new Loader.LoaderItem('http://www.che168.com'),
    new Loader.LoaderItem('http://www.china.com.cn'),
    new Loader.LoaderItem('http://www.china.com'),
    new Loader.LoaderItem('http://www.chinacars.com'),
    new Loader.LoaderItem('http://www.chinadaily.com.cn'),
    new Loader.LoaderItem('http://www.chinahr.com'),
    new Loader.LoaderItem('http://www.chinamobile.com'),
    new Loader.LoaderItem('http://www.chinanews.com.cn'),
    new Loader.LoaderItem('http://www.chinaren.com'),
    new Loader.LoaderItem('http://www.chinaz.com'),
    new Loader.LoaderItem('http://www.chip.de'),
    new Loader.LoaderItem('http://www.chosun.com'),
    new Loader.LoaderItem('http://www.ciao.de'),
    new Loader.LoaderItem('http://www.citibank.com'),
    new Loader.LoaderItem('http://www.citicards.com'),
    new Loader.LoaderItem('http://www.city-data.com'),
    new Loader.LoaderItem('http://www.citysearch.com'),
    new Loader.LoaderItem('http://www.clarin.com'),
    new Loader.LoaderItem('http://www.classmates.com'),
    new Loader.LoaderItem('http://www.clubpenguin.com'),
    new Loader.LoaderItem('http://www.cmbchina.com'),
    new Loader.LoaderItem('http://www.cncmax.cn'),
    new Loader.LoaderItem('http://www.cnet.com')
];

// Create a BulkHtmlLoader instance and start the queue
new Loader()

    /**
     * Custom warning callback (optional)
     */
    .onWarning(function(loaderItem, next){
        console.log(this.getProgressString() + ' ' + loaderItem.toString()); // [Object LoaderItem] Warning {code} {description} {url}
        next(loaderItem);
    })

    /**
     * Custom error callback (optional)
     */
    .onError(function(loaderItem, next){
        console.log(this.getProgressString() + ' ' + loaderItem.toString()); // [Object LoaderItem] Error {code} {description} {url}
        next(loaderItem);
    })

    /**
     * Custom item complete callback (optional)
     */
    .onItemLoadComplete(function(loaderItem, next){
        console.log(this.getProgressString() + ' ' + loaderItem.toString()); // [Object LoaderItem] Error {code} {description} {url}
        next(loaderItem);
    })

    /**
     * Custom callback for any status change (optional)
     * Notice that this callback has no arguments
     */
    .onChange(function(){
        console.log(this.toString()); // [Object BulkHtmlLoader] progress: 1/500, success: 1, warnings: 0, errors: 0, current open connections: 24, max concurrent connections: 25
    })

    .setNumRetries(3)
    .setHttpTimeout(5000)
    .setMaxConcurrentConnections(25)

    /**
     * Final callback once the queue completes
     */
    .load(queue, function(err, loaderItems){

        loaderItems.forEach(function(loaderItem){
            if(loaderItem.getStatus() === Loader.LoaderItem.COMPLETE){
               // Handle results
            }
        });
    });