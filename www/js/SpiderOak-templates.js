var tmpl = (function(){
function encodeHTMLSource() {var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': '&#34;', "'": '&#39;', "/": '&#47;' },matchHTML = /&(?!#?w+;)|<|>|"|'|\//g;return function() {return this ? this.replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : this;};};
  String.prototype.encodeHTML=encodeHTMLSource();
  var tmpl=tmpl|| {};
  tmpl['aboutSpiderOakViewTemplate']=function anonymous(it) {
var out='<div><div style="display:'+( it.actionBar ? 'block' : 'none' )+'"><div id="nav" class="nav"><a class="back-btn"></a><div class="title">About SpiderOak</div></div></div><div class="about-spideroak-content"><p>The SpiderOak '+( it.platform )+' application provides an easy way to access your data on the move, open ShareRooms, view historical versions, and quickly email files to friends, colleagues, and/or clients.</p><p>However - you don’t have to be a SpiderOak user to enjoy the benefits of our '+( it.platform )+' application. You can open the ShareRoom of a friend or colleague by entering their ShareID and a valid RoomKey. You can also email files through a secure link.</p><p>If you would like to learn more about SpiderOak, please visit <a href="#spideroak" data-url="https:    <p>Thank you for using SpiderOak and please don’t hesitate to send comments or questions to <a href="#email-feedback" class="email-link">'+( it.platform )+'@spideroak.com</a>.</p></div></div>';return out;
};
  tmpl['addShareRoomTemplate']=function anonymous(it) {
var out='<div><form name="add-share-room" class="login-form"><div class="login-input"><input id="shareid" type="text" name="shareid"autocorrect="off" autocapitalize="off"placeholder="Share Id"tabindex="1" /></div><div style="height:5px;"></div><div class="login-input"><input id="roomkey" type="text" name="roomkey"autocorrect="off" autocapitalize="off"placeholder="Room Key"tabindex="2" /></div><div class="checkswitch-wrapper"><div class="checkswitch"><input type="checkbox" id="remember" name="remember"';if(it.remembering){out+=' checked ';}out+='tabindex="-1" /><label for="remember"><span data-off="No" data-on="Yes"></span></label></div><label style="float:right; padding:0 20px; color:#666; font-size: 90%;">Remember ShareRoom</label><div class="clearfix"></div></div><a class="button addShareRoomsButton" tabindex="-1">Add ShareRoom</a><input type="submit" style="visibility:hidden" tabindex="-1" /></form></div>';return out;
};
  tmpl['androidContextPopup']=function anonymous(it) {
var out='<ul>';var arr1=it.items;if(arr1){var item,index=-1,l1=arr1.length-1;while(index<l1){item=arr1[index+=1];out+='<li><a data-command="'+( item.className )+'">'+( item.description )+'</a></li>';} } out+='</ul>';return out;
};
  tmpl['favoritesViewTemplate']=function anonymous(it) {
var out='<div><ul class="folderViewLoading loadingFiles"><li>Loading...</li></ul><ul class="filesList" ></ul></div>';return out;
};
  tmpl['fileItemDetailsToolbarViewTemplate']=function anonymous(it) {
var out='<div class="toolbar-button"><a class="file-share-button';if(!it.disabled){out+=' enabled';}out+='"><i class="icon-share"></i></a></div><div class="toolbar-button"><a class="file-save-button';if(!it.disabled){out+=' enabled';}out+='"><i class="icon-download"></i></a></div><div class="toolbar-button"><a class="file-send-button';if(!it.disabled){out+=' enabled';}out+='"><i class="icon-link"></i></a></div><div class="toolbar-button"><a class="file-favorite-button rightButton';if(it.isFavorite){out+=' favorite';}if(!it.disabled){out+=' enabled';}out+='"><i class="icon-star-2"></i></a></div>';return out;
};
  tmpl['fileItemDetailsViewTemplate']=function anonymous(it) {
var out='<div class="fileDetails-container"><div class="fileDetails"><div><i class="icon-'+(it.icon)+' icon-large"></i> '+(it.description)+' file</div><div class="name">'+(it.name)+'</div><div class="section"><div><span class="label">Size:</span>'+(window.fileHelper.readableFileSize(it.size))+'</div><div><span class="label">Created:</span>'+(window.moment(it.ctime+"", "X").format("llll"))+'</div><div><span class="label">Last Modified:</span>'+(window.moment(it.mtime+"", "X").format("llll"))+'</div></div></div><div class="versions" style="display:none;"><ul class="versionsViewLoading loadingVersions"><li class="sep">Loading...</li></ul></div></div>';return out;
};
  tmpl['fileItemViewMinTemplate']=function anonymous(it) {
var out='<a><div style="overflow:hidden;text-overflow:ellipsis;width:100%;"class="fileItem icon-'+(it.icon);if(it.isFavorite){out+=' favorite';}out+='">'+(it.name)+'</div></a>';return out;
};
  tmpl['fileItemViewTemplate']=function anonymous(it) {
var out='<a><div class="icon"><i class="icon-'+(it.icon)+'"></i></div><div class="filename">'+(it.name)+'</div><div class="subtext darkgray"><div class="file-info">'+(it.escription)+','+(window.fileHelper.readableFileSize(it.size))+'</div><div class="file-modified">'+(window.moment(it.mtime+"", "X").fromNow())+'</div><div class="clearfix"></div></div><div class="rightButton';if(it.isFavorite){out+=' favorite';}out+='"><i class="icon-star-2 innershadow"></i></div></a>';return out;
};
  tmpl['fileVersionsItemViewMinTemplate']=function anonymous(it) {
var out='<a><div style="overflow:hidden;text-overflow:ellipsis;width:100%;"class="icon-'+(it.icon);if(it.isFavorite){out+=' favorite';}out+='">'+(window.moment(it.mtime+"", "X").format("llll"))+'</div></a>';return out;
};
  tmpl['fileVersionsItemViewTemplate']=function anonymous(it) {
var out='<a><div class="icon"><i class="icon-'+(it.icon)+'"></i></div><div style="font-size: 80%;" class="filename">'+(window.moment(it.mtime+"", "X").format("llll"))+'</div><div class="subtext darkgray"><div class="file-info">'+(window.fileHelper.readableFileSize(it.size))+'</div><div class="clearfix"></div></div></a>';return out;
};
  tmpl['folderItemViewTemplate']=function anonymous(it) {
var out='<a><div class="icon"><i class="icon-folder"></i></div><div class="foldername">'+(it.name)+'</div></a>';return out;
};
  tmpl['folderViewTemplate']=function anonymous(it) {
var out='<div><ul class="foldersList"></ul><ul class="filesList" ></ul><ul class="folderViewLoading loadingFolders loadingFiles"><li class="sep">Loading...</li></ul></div>';return out;
};
  tmpl['getShareRoomPasswordTemplate']=function anonymous(it) {
var out='<div><form name="get-share-room-password" class="login-form"><ul style="font-size:80%;"><li><div class="label">Share ID</div><div class="info">'+(it.share_id)+'</div><div class="clearfix"></div></li><li><div class="label">Room Key</div><div class="info">'+(it.room_key)+'</div><div class="clearfix"></div></li></ul><div class="login-input" style="margin-top: 2em"><input id="pwrd" type="password" name="pwrd"autocorrect="off" autocapitalize="off"placeholder="Password"tabindex="1" /></div><a class="button submitPasswordButton" tabindex="-1">Submit Password</a><input type="submit" style="visibility:hidden" tabindex="-1" /></form></div>';return out;
};
  tmpl['menusheetTemplate']=function anonymous(it) {
var out='<div class="content"><ul class="hive-sep" style="display:none;"><li class="sep"></li></ul><ul class="hive"></ul><ul class="devices-sep" style="display:none;"><li class="sep">Devices</li></ul><ul class="devices"></ul><ul><li class="sep">Sections</li></ul><ul class="sections"><li class="current"><a href="#" class="sharerooms"><i class="icon-cloud-upload"></i> ShareRooms</a></li><li><a class="favorites"><i class="icon-star"></i> Favorites</a></li><li><a class="recents"><i class="icon-clock"></i> Recents</a></li><li><a class="settings"><i class="icon-cog"></i> Settings</a></li><li class="sep"></li><li><a class="about"><i class="icon-info"></i> About SpiderOak</a></li><li><a class="logout"><i class="icon-exit"></i>Log '+(it.inorout)+'</a></li></ul></div>';return out;
};
  tmpl['progressDialog']=function anonymous(it) {
var out='<div class="progress-dialog"><h3 class="title">'+(it.title)+'</h3><p class="subtitle">'+(it.subtitle)+'</p><div class="meter"><span class="progress" style="width: '+(it.start)+'%"></span></div></div>';return out;
};
  tmpl['publicShareRoomItemViewTemplate']=function anonymous(it) {
var out='<a href=\'#share\'><div class="icon"><i class=\'icon-cloud-upload\'></i></div>'; if (it.password_required) { out+='<div class="foldername"><i class="icon-lock" style="color:#999;font-size:80%;"></i><em>'+(it.share_id)+' / '+(it.room_key)+'</em></div>'; } else { out+='<div class="foldername">'; if (name) { if(it.password){out+='<i class="icon-unlocked" style="color:#999;font-size:80%;"></i>';}out+=(it.name); } else if (it.beenSituated) { out+='<span title="Fetch failed, try later" style="color:#999"> &asymp; </span><em>'+(it.share_id)+' / '+(it.room_key)+'</em>'; } else { out+='<span style=\'color:#999;\'>Loading...</span>'; } out+='</div>'; } out+='<div class=\'rightButton removePublicShare\'><i class=\'icon-close\'></i></div></a>';return out;
};
  tmpl['pubshareItemDetailsViewTemplate']=function anonymous(it) {
var out='<div class="fileDetails-container"><div class="fileDetails"><div><i class="icon-'+(it.icon)+' icon-large"></i> '+(it.kind)+' </div>'; if (it.password_required) { out+='<div> <span> <strong> Password pending </strong> </span> </div>'; } else if (!it.name) { out+='<div> <span> <strong> Successful fetch pending </strong> </span> </div>'; } else { out+='<div><span class="name">'+(it.name )+'</span></div>'; } out+='<div class="section"><div><span class="label">Share ID:</span>'+(it.share_id)+'</div><div><span class="label">Room Key:</span>'+(it.room_key )+'</div>'; if (it.name) { out+='<div><span class="label">Owner:</span>'+(it.owner_firstname )+' '+(it.owner_lastname )+'</div><div><span class="label">Description:</span><blockquote> '+(it.description )+' </blockquote></div><div><span class="label">Folders:</span>'+(it.number_of_folders )+'</div><div><span class="label">Files:</span>'+(it.number_of_files )+'</div>'; } out+='<div><span class="label">Remembering:</span>'; if (it.remember) { out+='Yes'; } else { out+='No'; } out+='</div>'; if (! it.password_required && it.password) { out+='<div><span class="label">Password</span> Protected</div>'; } out+='</div></div></div>';return out;
};
  tmpl['recentsViewTemplate']=function anonymous(it) {
var out='<div><ul class="folderViewLoading loadingFiles"><li>Loading...</li></ul><ul class="filesList" ></ul></div>';return out;
};
  tmpl['rememberMeWarningViewTemplate']=function anonymous(it) {
var out='<div><div class="rememberme-warning-content"><h2 style="text-align: center;">Please note</h2><p style="padding: 0 20px;">The &ldquo;Remember Me&rdquo; functionality is very convenient. However, the login details are only as safe as physical access to your device.<br><br>Selecting the &ldquo;Remember Me&rdquo; function will enable access to the data stored within SpiderOak in the event that your phone is lost or stolen. We suggest using caution when selecting this option.<br><br>This option can be changed at any time in your settings.</p><div><a class="button remember-me">OK, I understand</a></div><div><a class="button forget-me">Forget it, forget me</a></div></div></div>';return out;
};
  tmpl['settingsAccountViewTemplate']=function anonymous(it) {
var out='<div><ul style="font-size:80%;"><li><div class="label">Name</div><div class="info">'+(it.firstname + " " + it.lastname)+'</div><div class="clearfix"></div></li>'; if (spiderOakApp.b32nibbler.decode(spiderOakApp.accountModel.get("b32username")) !== it.loginname) { out+='<li><div class="label">Login name</div><div class="info">'+(it.loginname)+'</div><div class="clearfix"></div></li>'; } out+='<li><div class="label">Username</div><div class="info">'+(spiderOakApp.b32nibbler.decode(spiderOakApp.accountModel.get("b32username")))+'</div><div class="clearfix"></div></li><li><div class="label">Used</div><div class="info">';it.backupsizeout+='</div><div class="clearfix"></div></li><li><div class="label">Total</div><div class="info">';it.sizeout+='GB</div><div class="clearfix"></div></li><li><div class="label">Devices</div><div class="info">'+(spiderOakApp.menuSheetView.devicesCollection.length)+'</div><div class="clearfix"></div></li></ul></div>';return out;
};
  tmpl['settingsServerViewTemplate']=function anonymous(it) {
var out='<!-- @FIXME: we will probably need some organized styles for settings --><div><div style="height:20px;"></div><form class="login-form" name="server-form"><div><!-- UI FOR FUTURE PROTOCOL CHOICE --><!-- <div style="float:left;margin: 0 0 20px 20px"><select name="protocol-select" style="outline:none;"><option>https:          <option>http:        </select></div> --><!-- <div style="width:70%;float:right;" class="xxx"> --><div class="login-input"><input id="serverInput" type="text" name="server"requiredclass="input-block-level"autocorrect="off" autocapitalize="off"placeholder="Server"value="'+(it.server)+'" /></div><!-- </div> --><div class="clearfix"></div></div><div><a class="button changeServerButton" tabindex="-1">Submit</a></div><input type="submit" style="visibility:hidden" /></form>';if(it.isLoggedIn){out+='<div align="center">Note: changing the server address will log the current session out.</div>';}out+='</div>';return out;
};
  tmpl['settingsViewTemplate']=function anonymous(it) {
var out='<div><ul><li><a class="send-feedback">Send feedback</a></li></ul>';if(spiderOakApp.accountModel.get("isLoggedIn")){out+='<ul><li class="sep">Account</li></ul><ul style="font-size:80%;"><li><a class="account-settings"><div class="label">Name</div><div class="info">'+([it.firstname, it.lastname].join(" "))+'</div><div class="clearfix"></div></a></li><li style="padding: 15px 10px 25px 10px;"><span style="float:left;color:#666;">Remember me</span><div class="checkswitch"><input type="checkbox" id="settings-rememberme" name="settings-rememberme"';if(spiderOakApp.accountModel.get("rememberme")){out+='checked=\'true\'';}out+=' /><label for="settings-rememberme"><span data-off="No" data-on="Yes"></span></label></div><div class="clearfix"></div></li></ul>';}out+='<ul><li class="sep">Primary Server</li></ul><ul style="font-size:80%;"><li><a class="server"><div class="label">Server</div><div class="info">'+(it.server)+'</div><div class="clearfix"></div></a></li></ul><ul><li class="sep">Version</li></ul><ul style="font-size:80%;"><li style="padding: 15px 10px 25px 10px;"><div class="label">Version</div><div class="info">'+(spiderOakApp.version)+'</div><div class="clearfix"></div></li></ul></div>';return out;
};
  tmpl['shareItemDetailsViewTemplate']=function anonymous(it) {
var out='<div class="fileDetails-container"><div class="fileDetails"><div><i class="icon-'+(it.icon)+' icon-large"></i> '+(it.kind)+' </div><div><span class="name">'+(it.name)+'</span></div><div class="section"><div><span class="label">Share ID:</span>'+(it.share_id)+'</div><div><span class="label">Room Key:</span>'+(it.room_key)+'</div><div><span class="label">Description:</span><blockquote> '+(it.description)+' </blockquote></div><div><span class="label">Folders:</span>'+(it.number_of_folders)+'</div><div><span class="label">Files:</span>'+(it.number_of_files)+'</div></div></div></div>';return out;
};
  tmpl['shareRoomItemViewTemplate']=function anonymous(it) {
var out='<a><div class="icon"><i class="icon-cloud-upload"></i></div><div class="foldername">'+(it.name)+'</div></a>';return out;
};
  tmpl['shareRoomsRootViewTemplate']=function anonymous(it) {
var out='<div><div class="myShareRoomsSection"><ul><li class="sep">My Shares</li></ul><ul class="myShareRoomsList"></ul><ul class="mySharesViewLoading loadingMyShares"><li class="sep">Loading...</li></ul></div><div class="visitedShareRoomsSection"><ul><li class="sep" style="white-space: nowrap">Public Shares</li></ul><ul class="visitedSharesViewLoading loadingVisitedShares"></ul><ul class="visitedShareRoomsList"></ul><ul class="visitedSharesViewLoading loadingVisitedShares"><li class="sep">Loading...</li></ul></div></div>';return out;
};
  tmpl['storageBarTemplate']=function anonymous(it) {
var out='<div class="bar-graph"><div class="inner" style="width:'+(it.percentUsed)+'%;"></div></div><div class="devices-info"><div style="float:left;">'+(it.devices)+' device'+( ((it.devices > 1) ? "s" : "") )+'</div><div style="float:right;">'+(it.backupsize)+' / '+(it.size)+' GB</div><div class="clear"></div></div>';return out;
};
  tmpl['waitDialog']=function anonymous(it) {
var out='<div class="wait-dialog"><h3 class="title">'+(it.title)+'</h3><p class="subtitle">'+(it.subtitle)+'</p><div id="fadingBarsG"><div id="fadingBarsG_1" class="fadingBarsG"></div><div id="fadingBarsG_2" class="fadingBarsG"></div><div id="fadingBarsG_3" class="fadingBarsG"></div><div id="fadingBarsG_4" class="fadingBarsG"></div><div id="fadingBarsG_5" class="fadingBarsG"></div><div id="fadingBarsG_6" class="fadingBarsG"></div><div id="fadingBarsG_7" class="fadingBarsG"></div><div id="fadingBarsG_8" class="fadingBarsG"></div></div></div>';return out;
};
return tmpl;})()