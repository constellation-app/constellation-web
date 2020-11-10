export class IconManager {

    /* Create a mapping of built in icons. Icons are grouped by Category. Icon descriptions in Graph JSON is
     * of the form <CATEGORY><NAME> .. hence the JSON icon name 'Background.Flat Circle' refers to the icon called
     * 'Flat Circle' from the 'Background.' category.
     * To access this same icon info from the below dict is done using this.ICONS['Background.']['Flat Circle']
     * however this is not required by isers of the package, rather they would just call getIconId with the name
     * they are looking for 'Background.Flat Circle' to find the index of this oicon in the flat list of icon info
     * iconMap.
     */
    private ICONS = {
        '': {
            'Noise': 'icons/noise.png', 'Transparent': 'icons/transparent.png', 'Unknown': 'icons/003f.png',
            '': 'icons/transparent.png', 'Directed Loop': 'icons/loop_directed.png',
            'Undirected Loop': 'icons/loop_undirected.png'
        },
        'Background.': {
            'Flat Circle': 'icons/flat_circle.png', 'Flat Square': 'icons/flat_square.png',
            'Flat Triangle': 'icons/flat_triangle.png', 'Round Circle': 'icons/round_circle.png',
            'Round Square': 'icons/round_square.png', 'Edge Square': 'icons/edge_square.png'
        },
        'Communications.': {
            'Call': '/icons/call.png', 'Cell Tower': 'icons/cell_tower.png', 'Chat': 'icons/chat.png',
            'Email': 'icons/email.png', 'Group Chat': 'icons/group_chat.png', 'Phone': 'icons/phone.png',
            'SIM Card': 'icons/sim_card.png', 'SIP Call': 'icons/sip_call.png', 'Tablet': 'icons/tablet.png',
            'Video Chat': 'icons/video_chat.png'
        },
        'Character.': {
            'Space': 'icons/0020.png', 'Exclaimation Mark': 'icons/0021.png', 'Quotation Mark': 'icons/0022.png',
            'Hash': 'icons/0023.png', 'Dollar Symbol': 'icons/0024.png', 'Percent Symbol': 'icons/0025.png',
            'Ampersand': 'icons/0026.png', 'Inverted Comma': 'icons/0027.png', 'Opening Round Bracket': 'icons/0028.png',
            'Closing Round Bracket': 'icons/0029.png', 'Asterisk': 'icons/002a.png', 'Plus': 'icons/002b.png',
            'Comma': 'icons/002c.png', 'Dash': 'icons/002d.png', 'Full Stop': 'icons/002e.png',
            'Forward Slash': 'icons/002f.png', '0': 'icons/0030.png', '1': 'icons/0031.png', '2': 'icons/0032.png',
            '3': 'icons/0033.png', '4': 'icons/0034.png', '5': 'icons/0035.png', '6': 'icons/0036.png',
            '7': 'icons/0037.png', '8': 'icons/0038.png', '9': 'icons/0039.png', 'Colon': 'icons/003a.png',
            'Semi-Colon': 'icons/003b.png', 'Less Than': 'icons/003c.png', 'Equals': 'icons/003d.png',
            'Greater Than': 'icons/003e.png', 'Question Mark': 'icons/003f.png', 'At Symbol': 'icons/0040.png',
            'A': 'icons/0041.png', 'B': 'icons/0042.png', 'C': 'icons/0043.png', 'D': 'icons/0044.png',
            'E': 'icons/0045.png', 'F': 'icons/0046.png', 'G': 'icons/0047.png', 'H': 'icons/0048.png',
            'I': 'icons/0049.png', 'J': 'icons/004a.png', 'K': 'icons/004b.png', 'L': 'icons/004c.png',
            'M': 'icons/004d.png', 'N': 'icons/004e.png', 'O': 'icons/004f.png', 'P': 'icons/0050.png',
            'Q': 'icons/0051.png', 'R': 'icons/0052.png', 'S': 'icons/0053.png', 'T': 'icons/0054.png',
            'U': 'icons/0055.png', 'V': 'icons/0056.png', 'W': 'icons/0057.png', 'X': 'icons/0058.png',
            'Y': 'icons/0059.png', 'Z': 'icons/005a.png', 'Opening Square Bracket': 'icons/005b.png',
            'Back Slash': 'icons/005c.png', 'Closing Square Bracket': 'icons/005d.png', 'Carot': 'icons/005e.png',
            'Underscore': 'icons/005f.png', 'Back Tick': 'icons/0060.png', 'a': 'icons/0061.png', 'b': 'icons/0062.png',
            'c': 'icons/0063.png', 'd': 'icons/0064.png', 'e': 'icons/0065.png', 'f': 'icons/0066.png',
            'g': 'icons/0067.png', 'h': 'icons/0068.png', 'i': 'icons/0069.png', 'j': 'icons/006a.png',
            'k': 'icons/006b.png', 'l': 'icons/006c.png', 'm': 'icons/006d.png', 'n': 'icons/006e.png',
            'o': 'icons/006f.png', 'p': 'icons/0070.png', 'q': 'icons/0071.png', 'r': 'icons/0072.png',
            's': 'icons/0073.png', 't': 'icons/0074.png', 'u': 'icons/0075.png', 'v': 'icons/0076.png',
            'w': 'icons/0077.png', 'x': 'icons/0078.png', 'y': 'icons/0079.png', 'z': 'icons/007a.png',
            'Opening Curly Bracket': 'icons/007b.png', 'Pipe': 'icons/007c.png',
            'Closing Curly Bracket':'icons/007d.png', 'Tilder': 'icons/007e.png',
            'Skull & Crossbones': 'icons/2620.png', 'Hammer & Sickle': 'icons/262d.png',
            'Sad Face': 'icons/2639.png', 'Smiley Face': 'icons/263a.png'
        },
        'Document.': {
            'Identification': 'icons/identification.png', 'Paperclip': 'icons/paperclip.png',
            'Passport': 'icons/passport.png'
        },
        'Internet.': {
            'Aim': 'icons/aim.png', 'Airbnb': 'icons/airbnb.png', 'Amazon': 'icons/amazon.png',
            'Android': 'icons/android.png', 'AOL': 'icons/aol.png', 'Apple': 'icons/apple.png',
            'Baidu': 'icons/baidu.png', 'Bankin': 'icons/bankin.png', 'Behance': 'icons/behance.png',
            'Bing': 'icons/bing.png', 'Bitly': 'icons/bitly.png', 'Bittorrent': 'icons/bittorrent.png',
            'Blackberry': 'icons/blackberry.png', 'Blender': 'icons/blender.png', 'Blogger': 'icons/blogger.png',
            'Chrome': 'icons/chrome.png', 'Codepen': 'icons/codepen.png', 'Dailymotion': 'icons/dailymotion.png',
            'Deviantart': 'icons/deviantart.png', 'Dribbble': 'icons/dribbble.png', 'Drive': 'icons/drive.png',
            'Dropbox': 'icons/dropbox.png', 'Ebay': 'icons/ebay.png', 'Envato': 'icons/envato.png',
            'Evernote': 'icons/evernote.png', 'Facebook': 'icons/facebook.png', 'Fancy': 'icons/fancy.png',
            'Feedly': 'icons/feedly.png', 'Firefox': 'icons/firefox.png', '500px': 'icons/five_hundred_px.png',
            'Flickr': 'icons/flickr.png', 'Foursquare': 'icons/foursquare.png', 'Github': 'icons/github.png',
            'Gmail': 'icons/gmail.png', 'Google': 'icons/google.png', 'Google+': 'icons/google_plus.png',
            'Hangouts': 'icons/hangouts.png', 'ICQ': 'icons/icq.png', 'IMDB': 'icons/imdb.png',
            'Imgur': 'icons/imgur.png', 'Instagram': 'icons/instagram.png',
            'Internet Explorer': 'icons/internet_explorer.png', 'Invision': 'icons/invision.png',
            'Jabber': 'icons/jabber.png', 'Kakao Talk': 'icons/kakao_talk.png', 'Kik': 'icons/kik.png',
            'Lastfm': 'icons/lastfm.png', 'Linkedin': 'icons/linkedin.png',  'Magento': 'icons/magento.png',
            'Medium': 'icons/medium.png', 'Messenger': 'icons/messenger.png', 'MSN': 'icons/msn.png',
            'Naver': 'icons/naver.png', 'Netflix': 'icons/netflix.png', 'Office': 'icons/office.png',
            'OpenID': 'icons/openid.png', 'Opera': 'icons/opera.png', 'Outlook': 'icons/outlook.png',
            'Pandora': 'icons/pandora.png', 'Pastebin': 'icons/pastebin.png', 'Paypal': 'icons/paypal.png',
            'Periscope': 'icons/periscope.png', 'Photoshop': 'icons/photoshop.png', 'Picasa': 'icons/picasa.png',
            'Pinterest': 'icons/pinterest.png', 'Pocket': 'icons/pocket.png', 'Principle': 'icons/principle.png',
            'Product Hunt': 'icons/product_hunt.png', 'QQ': 'icons/qq.png', 'Rdio': 'icons/rdio.png',
            'Reddit': 'icons/reddit.png', 'RSS': 'icons/rss.png', 'Safari': 'icons/safari.png',
            'Scoopit': 'icons/scoopit.png', 'Shopify': 'icons/shopify.png', 'Sina Weibo': 'icons/sina_weibo.png',
            'Sketch': 'icons/sketch.png', 'Skype': 'icons/skype.png', 'Slack': 'icons/slack.png',
            'Slashdot': 'icons/slashdot.png', 'Snapchat': 'icons/snapchat.png', 'Soundcloud': 'icons/soundcloud.png',
            'Spotify': 'icons/spotify.png', 'Stackoverflow': 'icons/stackoverflow.png',
            'Surespot': 'icons/surespot.png', 'Talkbox': 'icons/talkbox.png', 'Tango': 'icons/tango.png',
            'Telegram': 'icons/telegram.png', 'Tinder': 'icons/tinder.png', 'Trello': 'icons/trello.png',
            'Tumblr': 'icons/tumblr.png', 'Twitch': 'icons/twitch.png', 'Twitter': 'icons/twitter.png',
            'Viadeo': 'icons/viadeo.png', 'Viber': 'icons/viber.png', 'Vimeo': 'icons/vimeo.png',
            'Vine': 'icons/vine.png', 'VK': 'icons/vk.png', 'Weixin': 'icons/weixin.png',
            'Whatsapp': 'icons/whatsapp.png', 'Wikipedia': 'icons/wikipedia.png', 'Wordpress': 'icons/wordpress.png',
            'Yahoo': 'icons/yahoo.png', 'Yelp': 'icons/yelp.png', 'Youtube': 'icons/youtube.png',
            'Zello': 'icons/zello.png'
        },
        'Miscellaneous.': {
            'Bomb': 'icons/bomb.png', 'Camera': 'icons/camera.png', 'Chart': 'icons/chart.png',
            'Clock': 'icons/clock.png', 'Cloud': 'icons/cloud.png', 'Dalek': 'icons/dalek.png',
            'False': 'icons/false.png', 'Flame': 'icons/flame.png', 'Fingerprint': 'icons/fingerprint.png',
            'Galaxy': 'icons/galaxy.png', 'Globe': 'icons/globe.png', 'Graph': 'icons/graph.png',
            'HAL-9000': 'icons/hal-9000.png', 'Heart': 'icons/heart.png', 'Infinity': 'icons/infinity.png',
            'Invader': 'icons/invader.png', 'Key': 'icons/key.png', 'Lock': 'icons/lock.png',
            'Lightning': 'icons/lightning.png', 'Map': 'icons/map.png', 'Marker': 'icons/marker.png',
            'Mr Squiggle': 'icons/mr_squiggle.png', 'Music': 'icons/music.png', 'Puzzle': 'icons/puzzle.png',
            'Shield': 'icons/shield.png', 'Signal': 'icons/signal.png', 'Snowflake': 'icons/snowflake.png',
            'Star': 'icons/star.png', 'True': 'icons/true.png'
        },
        'Network.': {
            'Bluetooth': 'icons/bluetooth.png', 'Cookie': 'icons/cookie.png', 'Compact Disk': 'icons/compact_disk.png',
            'Desktop': 'icons/desktop.png', 'Floppy Disk': 'icons/floppy_disk.png',
            'Graphics Processing Unit': 'icons/graphics_processing_unit.png', 'Headset': 'icons/headset.png',
            'Internet': 'icons/internet.png', 'Keyboard': 'icons/keyboard.png', 'Laptop': 'icons/laptop.png',
            'Linux': 'icons/linux.png', 'Malware': 'icons/malware.png', 'Microprocessor': 'icons/microprocessor.png',
            'Mouse': 'icons/mouse.png', 'Network': 'icons/network.png',
            'Network Interface Card': 'icons/network_interface_card.png', 'OSX': 'icons/osx.png',
            'Printer': 'icons/printer.png', 'Router': 'icons/router.png', 'SD Card': 'icons/sd_card.png',
            'Server': 'icons/server.png', 'Speaker': 'icons/speaker.png',
            'Uniform Resource Locator': 'icons/uniform_resource_locator.png',
            'Universal Serial Bus': 'icons/universal_serial_bus.png',
            'Webcam': 'icons/webcam.png', 'Windows': 'icons/windows.png'
        },
        'Person.': {
            "Group": "icons/group.png", "Person": "icons/person.png"
        },
        'Security.': {
            "MD5": "icons/md5.png", "SHA1": "icons/sha1.png", "SHA256": "icons/sha256.png"
        },
        'Structure.': {
            "City": "icons/city.png", "Building": "icons/building.png", "Factory": "icons/factory.png",
            "House": "icons/house.png"
        },
        'Transport.': {
            "Bike": "icons/bike.png", "Boat": "icons/boat.png", "Bus": "icons/bus.png", "Car": "icons/car.png",
            "Plane": "icons/plane.png", "Run": "icons/run.png", "Tardis": "icons/tardis.png",
            "Train": "icons/train.png", "Tram": "icons/tram.png", "Walk": "ext/icons/walk.png"
        },
        'Flag.': {
            'Afghanistan': 'icons/flags/afghanistan.png', 'Aland Islands': 'icons/flags/aland.png',
            'Albania': 'icons/flags/albania.png', 'Algeria': 'icons/flags/algeria.png',
            'Andorra': 'icons/flags/andorra.png', 'Angola': 'icons/flags/angola.png',
            'Anguilla': 'icons/flags/anguilla.png', 'Antigua and Barbuda': 'icons/flags/antigua_and_barbuda.png',
            'Argentina': 'icons/flags/argentina.png', 'Armenia': 'icons/flags/armenia.png',
            'Aruba': 'icons/flags/aruba.png', 'Australia': 'icons/flags/australia.png',
            'Austria': 'icons/flags/austria.png', 'Azerbaijan': 'icons/flags/azerbaijan.png',
            'Bahamas': 'icons/flags/bahamas.png', 'Bahrain': 'icons/flags/bahrain.png',
            'Bangladesh': 'icons/flags/bangladesh.png', 'Barbados': 'icons/flags/barbados.png',
            'Belarus': 'icons/flags/belarus.png', 'Belgium': 'icons/flags/belgium.png',
            'Belize': 'icons/flags/belize.png', 'Benin': 'icons/flags/benin.png', 'Bermuda': 'icons/flags/bermuda.png',
            'Bhutan': 'icons/flags/bhutan.png', 'Bolivia': 'icons/flags/bolivia.png',
            'Bosnia and Herzegovina': 'icons/flags/bosnia_and_herzegovina.png', 'Botswana': 'icons/flags/botswana.png',
            'Brazil': 'icons/flags/brazil.png', 'British Virgin Islands': 'icons/flags/british_virgin_islands.png',
            'Brunei': 'icons/flags/brunei.png', 'Bulgaria': 'icons/flags/bulgaria.png',
            'Burkina Faso': 'icons/flags/burkina_faso.png', 'Burundi': 'icons/flags/burundi.png',
            'Cambodia': 'icons/flags/cambodia.png', 'Cameroon': 'icons/flags/cameroon.png',
            'Canada': 'icons/flags/canada.png', 'Cape Verde': 'icons/flags/cape_verde.png',
            'Cayman Islands': 'icons/flags/cayman_islands.png',
            'Central African Republic': 'icons/flags/central_african_republic.png', 'Chad': 'icons/flags/chad.png',
            'Chile': 'icons/flags/chile.png', 'China': 'icons/flags/china.png', 'Colombia': 'icons/flags/colombia.png',
            'Comoros': 'icons/flags/comoros.png', 'Congo (Democratic)': 'icons/flags/congo_democratic.png',
            'Congo (Republic)': 'icons/flags/congo_republic.png', 'Cook Islands': 'icons/flags/cook_islands.png',
            'Costa Rica': 'icons/flags/costa_rica.png', 'Cote d\'Ivoire': 'icons/flags/cote_d\'ivoire.png',
            'Croatia': 'icons/flags/croatia.png', 'Cuba': 'icons/flags/cuba.png', 'Curacao': 'icons/flags/curacao.png',
            'Cyprus': 'icons/flags/cyprus.png', 'Czech Republic': 'icons/flags/czech_republic.png',
            'Denmark': 'icons/flags/denmark.png', 'Djibouti': 'icons/flags/djibouti.png',
            'Dominica': 'icons/flags/dominica.png', 'Dominican Republic': 'icons/flags/dominican_republic.png',
            'East Timor': 'icons/flags/east_timor.png', 'Ecuador': 'icons/flags/ecuador.png',
            'Egypt': 'icons/flags/egypt.png', 'El Salvador': 'icons/flags/el_salvador.png',
            'Equatorial Guinea': 'icons/flags/equatorial_guinea.png', 'Eritrea': 'icons/flags/eritrea.png',
            'Estonia': 'icons/flags/estonia.png', 'Ethiopia': 'icons/flags/ethiopia.png',
            'Falkland Islands': 'icons/flags/falkland_islands.png', 'Fiji': 'icons/flags/fiji.png',
            'Finland': 'icons/flags/finland.png', 'France': 'icons/flags/france.png', 'Gabon': 'icons/flags/gabon.png',
            'Gambia': 'icons/flags/gambia.png', 'Georgia': 'icons/flags/georgia.png',
            'Germany': 'icons/flags/germany.png', 'Ghana': 'icons/flags/ghana.png',
            'Gibraltar': 'icons/flags/gibraltar.png', 'Greece': 'icons/flags/greece.png',
            'Grenada': 'icons/flags/grenada.png', 'Guatemala': 'icons/flags/guatemala.png',
            'Guernsey': 'icons/flags/guernsey.png', 'Guinea': 'icons/flags/guinea.png',
            'Guinea Bissau': 'icons/flags/guinea_bissau.png', 'Guyana': 'icons/flags/guyana.png',
            'Haiti': 'icons/flags/haiti.png', 'Honduras': 'icons/flags/honduras.png',
            'Hong Kong': 'icons/flags/hong_kong.png', 'Hungary': 'icons/flags/hungary.png',
            'Iceland': 'icons/flags/iceland.png', 'India': 'icons/flags/india.png',
            'Indonesia': 'icons/flags/indonesia.png', 'Iran': 'icons/flags/iran.png','Iraq': 'icons/flags/iraq.png',
            'Ireland': 'icons/flags/ireland.png', 'Isle of Man': 'icons/flags/isle_of_man.png',
            'Israel': 'icons/flags/israel.png', 'Italy': 'icons/flags/italy.png', 'Jamaica': 'icons/flags/jamaica.png',
            'Japan': 'icons/flags/japan.png', 'Jersey': 'icons/flags/jersey.png', 'Jordan': 'icons/flags/jordan.png',
            'Kazakhstan': 'icons/flags/kazakhstan.png', 'Kenya': 'icons/flags/kenya.png',
            'Kiribati': 'icons/flags/kiribati.png', 'Kosovo': 'icons/flags/kosovo.png',
            'Kuwait': 'icons/flags/kuwait.png', 'Kyrgyzstan': 'icons/flags/kyrgyzstan.png',
            'Laos': 'icons/flags/laos.png', 'Latvia': 'icons/flags/latvia.png', 'Lebanon': 'icons/flags/lebanon.png',
            'Lesotho': 'icons/flags/lesotho.png', 'Liberia': 'icons/flags/liberia.png',
            'Libya': 'icons/flags/libya.png', 'Liechtenstein': 'icons/flags/liechtenstein.png',
            'Lithuania': 'icons/flags/lithuania.png', 'Luxembourg': 'icons/flags/luxembourg.png',
            'Macau': 'icons/flags/macau.png', 'Macedonia': 'icons/flags/macedonia.png',
            'Madagascar': 'icons/flags/madagascar.png', 'Malawi': 'icons/flags/malawi.png',
            'Malaysia': 'icons/flags/malaysia.png', 'Maldives': 'icons/flags/maldives.png',
            'Mali': 'icons/flags/mali.png', 'Malta': 'icons/flags/malta.png',
            'Marshall Islands': 'icons/flags/marshall_islands.png', 'Mauritania': 'icons/flags/mauritania.png',
            'Mauritius': 'icons/flags/mauritius.png', 'Mexico': 'icons/flags/mexico.png',
            'Micronesia': 'icons/flags/micronesia_federated.png', 'Moldova': 'icons/flags/moldova.png',
            'Monaco': 'icons/flags/monaco.png', 'Mongolia': 'icons/flags/mongolia.png',
            'Montenegro': 'icons/flags/montenegro.png', 'Montserrat': 'icons/flags/montserrat.png',
            'Morocco': 'icons/flags/morocco.png', 'Mozambique': 'icons/flags/mozambique.png',
            'Myanmar': 'icons/flags/myanmar.png', 'Namibia': 'icons/flags/namibia.png',
            'Nauru': 'icons/flags/nauru.png', 'Nepal': 'icons/flags/nepal.png',
            'Netherlands': 'icons/flags/netherlands.png', 'New Caledonia': 'icons/flags/new_caledonia.png',
            'New Zealand': 'icons/flags/new_zealand.png', 'Nicaragua': 'icons/flags/nicaragua.png',
            'Niger': 'icons/flags/niger.png', 'Nigeria': 'icons/flags/nigeria.png', 'Niue': 'icons/flags/niue.png',
            'North Koread': 'icons/flags/korea_north.png',
            'Northern Mariana Islands': 'icons/flags/northern_mariana_islands.png', 'Norway': 'icons/flags/norway.png',
            'Oman': 'icons/flags/oman.png', 'Pakistan': 'icons/flags/pakistan.png', 'Palau': 'icons/flags/palau.png',
            'Palestine': 'icons/flags/palestine.png', 'Panama': 'icons/flags/panama.png',
            'Papua New Guinea': 'icons/flags/papua_new_guinea.png', 'Paraguay': 'icons/flags/paraguay.png',
            'Peru': 'icons/flags/peru.png', 'Philippines': 'icons/flags/philippines.png',
            'Poland': 'icons/flags/poland.png', 'Portugal': 'icons/flags/portugal.png',
            'Puerto Rico': 'icons/flags/puerto_rico.png', 'Qatar': 'icons/flags/qatar.png',
            'Romania': 'icons/flags/romania.png', 'Russia': 'icons/flags/russia.png',
            'Rwanda': 'icons/flags/rwanda.png', 'Saint Kitts and Nevis': 'icons/flags/saint_kitts_and_nevis.png',
            'Saint Lucia': 'icons/flags/saint_lucia.png',
            'Saint Vincent and the Grenadines': 'icons/flags/saint_vincent_and_the_grenadines.png',
            'Samoa': 'icons/flags/samoa.png', 'San Marino': 'icons/flags/san_marino.png',
            'Sao Tome and Principe': 'icons/flags/sao_tome_and_principe.png',
            'Saudi Arabia': 'icons/flags/saudi_arabia.png', 'Senegal': 'icons/flags/senegal.png',
            'Serbia': 'icons/flags/serbia.png', 'Seychelles': 'icons/flags/seychelles.png',
            'Sierra Leone': 'icons/flags/sierra_leone.png', 'Singapore': 'icons/flags/singapore.png',
            'Slovakia': 'icons/flags/slovakia.png', 'Slovenia': 'icons/flags/slovenia.png',
            'Solomon Islands': 'icons/flags/solomon_islands.png', 'Somalia': 'icons/flags/somalia.png',
            'South Africa': 'icons/flags/south_africa.png', 'South Korea': 'icons/flags/korea_south.png',
            'South Sudan': 'icons/flags/south_sudan.png', 'Spain': 'icons/flags/spain.png',
            'Sri Lanka': 'icons/flags/sri_lanka.png', 'Sudan': 'icons/flags/sudan.png',
            'Suriname': 'icons/flags/suriname.png', 'Swaziland': 'icons/flags/swaziland.png',
            'Sweden': 'icons/flags/sweden.png', 'Switzerland': 'icons/flags/switzerland.png',
            'Syria': 'icons/flags/syria.png', 'Taiwan': 'icons/flags/taiwan.png',
            'Tajikistan': 'icons/flags/tajikistan.png', 'Tanzania': 'icons/flags/tanzania.png',
            'Thailand': 'icons/flags/thailand.png', 'Togo': 'icons/flags/togo.png',
            'Tokelau': 'icons/flags/tokelau.png', 'Tonga': 'icons/flags/tonga.png',
            'Trinidad and Tobago': 'icons/flags/trinidad_and_tobago.png', 'Tunisia': 'icons/flags/tunisia.png',
            'Turkey': 'icons/flags/turkey.png', 'Turkmenistan': 'icons/flags/turkmenistan.png',
            'Tuvalu': 'icons/flags/tuvalu.png', 'Uganda': 'icons/flags/uganda.png',
            'Ukraine': 'icons/flags/ukraine.png', 'United Arab Emirates': 'icons/flags/united_arab_emirates.png',
            'United Kingdom': 'icons/flags/united_kingdom.png',
            'United States': 'icons/flags/united_states_of_america.png', 'Uruguay': 'icons/flags/uruguay.png',
            'Uzbekistan': 'icons/flags/uzbekistan.png', 'Vanuatu': 'icons/flags/vanuatu.png',
            'Vatican City': 'icons/flags/vatican_city.png', 'Venezuela': 'icons/flags/venezuela.png',
            'Vietnam': 'icons/flags/vietnam.png', 'Yemen': 'icons/flags/yemen.png',
            'Zambia': 'icons/flags/zambia.png', 'Zimbabwe': 'icons/flags/zimbabwe.png'
        },
        'User Interface.': {
            'Axis (x)': 'icons/ui/axis_x.png', 'Axis (-x)': 'icons/ui/axis_x_negative.png',
            'Axis (y)': 'icons/ui/axis_y.png', 'Axis (-y)': 'icons/ui/axis_y_negative.png',
            'Axis (z)': 'icons/ui/axis_z.png', 'Axis (-z)': 'icons/ui/axis_z_negative.png',
            'Add': 'icons/ui/add.png', 'Add Alternate': 'icons/ui/add_alternate.png', 'Blazes': 'icons/ui/blazes.png',
            'Bookmark': 'icons/ui/bookmark.png', 'Check': 'icons/ui/check.png',
            'Chevron Down': 'icons/ui/chevron_down.png', 'Chevron Left': 'icons/ui/chevron_left.png',
            'Chevron Left Double': 'icons/ui/chevron_left_double.png', 'Chevron Right': 'icons/ui/chevron_right.png',
            'Chevron Right Double': 'icons/ui/chevron_right_double.png', 'Chevron Up': 'icons/ui/chevron_up.png',
            'Columns': 'icons/ui/columns.png', 'Connections': 'icons/ui/connections.png',
            'Connection Labels': 'icons/ui/connection_labels.png', 'Contract': 'icons/ui/contract.png',
            'Copy': 'icons/ui/copy.png', 'Cross': 'icons/ui/cross.png', 'Directed': 'icons/ui/directed.png',
            'Delete': 'icons/ui/delete.png', 'Download': 'icons/ui/download.png', 'Drag Drop': 'icons/ui/drag_drop.png',
            'Drag Word': 'icons/ui/drag_word.png', 'Draw Mode': 'icons/ui/draw_mode.png', 'Edges': 'icons/ui/edges.png',
            'Edit': 'icons/ui/edit.png', 'Error': 'icons/ui/error.png', 'Expand': 'icons/ui/expand.png',
            'Heart': 'icons/ui/heart.png', 'Help': 'icons/ui/help.png', 'Hidden': 'icons/ui/hidden.png',
            'Full Hop': 'icons/ui/hop_full.png', 'Half Hop': 'icons/ui/hop_half.png', 'One Hop': 'icons/ui/hop_one.png',
            'Information': 'icons/ui/information.png', 'Key': 'icons/ui/key.png', 'Labels': 'icons/ui/labels.png',
            'Links': 'icons/ui/links.png', 'Lock': 'icons/ui/lock.png', 'Menu': 'icons/ui/menu.png', '2D':
                'icons/ui/2d.png', '3D': 'icons/ui/3d.png', 'Nodes': 'icons/ui/nodes.png',
            'Node Labels': 'icons/ui/node_labels.png', 'Open': 'icons/ui/open.png', 'Play': 'icons/ui/play.png',
            'Refresh': 'icons/ui/refresh.png', 'Remove': 'icons/ui/remove.png',
            'Remove Alternate': 'icons/ui/remove_alternate.png', 'Report': 'icons/ui/report.png',
            'Search': 'icons/ui/search.png', 'Select Mode': 'icons/ui/select_mode.png',
            'Settings': 'icons/ui/settings.png', 'Share': 'icons/ui/share.png', 'Sort': 'icons/ui/sort.png',
            'Tag': 'icons/ui/tag.png', 'Transactions': 'icons/ui/transactions.png',
            'Undirected': 'icons/ui/undirected.png', 'Unlock': 'icons/ui/unlock.png', 'Upload': 'icons/ui/upload.png',
            'Visible': 'icons/ui/visible.png', 'Warning': 'icons/ui/warning.png', 'Zoom In': 'icons/ui/zoom_in.png',
            'Zoom Out': 'icons/ui/zoom_out.png'
        }
    };

    iconMap : Map<string, any> = new Map<string, any>();

    /**
     * Creates a new IconManager
     */
    constructor() {

        for (let category in this.ICONS) {
            // @ts-ignore
            for (let name in this.ICONS[category]) {
                // @ts-ignore
                this.iconMap.set(category + name, [this.iconMap.size, this.ICONS[category][name]]);
            }
        }
    }

    /**
     * Return the entire map of icons, indexed by their name, ie 'Background.Flat Circle'. The content of this
     * map is a 2 element array containing at position 0, the index that the corresponding icon is to be stored
     * at within the graphics cards icon TextureArray, the second element being the filename of the icon to store.
     */
    getIconMap = (): Map<string, any> => {
        return this.iconMap;
    }

    /**
     * Retrieve index of the icon with supplied name.
     * @param name Name (ie 'Background.Flat Circle') of the icon to retrieve information for.
     */
    getIconIndex = (name : string): any => {
        if (name != undefined) {
            if (this.iconMap.has(name)) {
                // @ts-ignore
                return this.iconMap.get(name)[0];
            } else {
                // @ts-ignore
                return this.iconMap.get('Unknown')[0];
            }
        }
        // @ts-ignore
        return this.iconMap.get('Unknown')[0];
    }
}