const userMetadata = {
  title: `Jeongyun.log`, // Blog title - Used for display in the navbar and used for SEO.
  description: `배우고 기록하고 성장하자.`, //Blog Description - Used for SEO.
  author: `Je0ngyun`,
  otherSite: `https://github.com/je0ngyun`, // Please enter the address of another site such as Facebook, Twitter, or Github.
  copyright: `Copyright ⓒ 2021 je0ngyun/JeongYun`,
  siteUrl: `https://je0ngyun.netlify.app`, // Enter the URL to deploy or deploy. Used to create a Sitemap and create Robots.txt.
  commentRepo: `je0ngyun/Blog`, // Please enter the Github repository where comments will be saved.
  googleVerification: ``, // Please enter the verification code from Google Search Console.
  naverVerification: ``, // Please enter the verification code from Naver Serarch Console.
  googleAnalyticsTrackingId: ``, // Please enter the TrackingId from GoogleAnalytics.
}

const pageMetadata = {
  //menu - Please enter a menu link to add to the navbar.
  //If you do not want to add a link to the navbar, you can leave it blank.
  menu: [
    { path: '/', linkname: 'Home' },
    { path: '/projects', linkname: 'Projects' },
    { path: '/develop', linkname: 'Develop' },
  ],
  //directorys - Enter the directory to be mapped with the page.
  //That directory is automatically linked to the gatsby filesystem.
  directorys: ['develop', 'projects'],
}

exports.pageMetadata = (() => {
  pageMetadata.menu = JSON.stringify(pageMetadata.menu)
  return pageMetadata
})()

exports.userMetadata = userMetadata
