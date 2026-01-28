const Country = require('../models/Country')
const fetch = require('node-fetch');

const countryController = {
    async getAllCountries(req, res) {
        try {
            const countries = await Country.findAll()
            res.json({
                success: true,
                data: countries // This should now be an array
            });
        } catch (err) {
            console.error('Get countries error', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching countries'
            });
        }
    },

    async getCountries(req, res) {
        try {
          // Try to fetch from external API
          const response = await fetch('https://general.apivcm.shop/countries');
          
          if (!response.ok) {
            throw new Error('External API failed');
          }
    
          const data = await response.json();
          
          if (data && data.success && data.data) {
            return res.json({
              success: true,
              data: data.data
            });
          } else {
            throw new Error('Invalid data format from external API');
          }
        } catch (error) {
          console.error('Error fetching countries from external API:', error);
          
          // Return fallback country list
          const fallbackCountries = [
            { country: "Afghanistan", international_dialing: "+93" },
            { country: "Albania", international_dialing: "+355" },
            { country: "Algeria", international_dialing: "+213" },
            { country: "Andorra", international_dialing: "+376" },
            { country: "Angola", international_dialing: "+244" },
            { country: "Argentina", international_dialing: "+54" },
            { country: "Armenia", international_dialing: "+374" },
            { country: "Australia", international_dialing: "+61" },
            { country: "Austria", international_dialing: "+43" },
            { country: "Azerbaijan", international_dialing: "+994" },
            { country: "Bahamas", international_dialing: "+1-242" },
            { country: "Bahrain", international_dialing: "+973" },
            { country: "Bangladesh", international_dialing: "+880" },
            { country: "Barbados", international_dialing: "+1-246" },
            { country: "Belarus", international_dialing: "+375" },
            { country: "Belgium", international_dialing: "+32" },
            { country: "Belize", international_dialing: "+501" },
            { country: "Benin", international_dialing: "+229" },
            { country: "Bhutan", international_dialing: "+975" },
            { country: "Bolivia", international_dialing: "+591" },
            { country: "Bosnia and Herzegovina", international_dialing: "+387" },
            { country: "Botswana", international_dialing: "+267" },
            { country: "Brazil", international_dialing: "+55" },
            { country: "Brunei", international_dialing: "+673" },
            { country: "Bulgaria", international_dialing: "+359" },
            { country: "Burkina Faso", international_dialing: "+226" },
            { country: "Burundi", international_dialing: "+257" },
            { country: "Cambodia", international_dialing: "+855" },
            { country: "Cameroon", international_dialing: "+237" },
            { country: "Canada", international_dialing: "+1" },
            { country: "Cape Verde", international_dialing: "+238" },
            { country: "Central African Republic", international_dialing: "+236" },
            { country: "Chad", international_dialing: "+235" },
            { country: "Chile", international_dialing: "+56" },
            { country: "China", international_dialing: "+86" },
            { country: "Colombia", international_dialing: "+57" },
            { country: "Comoros", international_dialing: "+269" },
            { country: "Congo", international_dialing: "+242" },
            { country: "Costa Rica", international_dialing: "+506" },
            { country: "Croatia", international_dialing: "+385" },
            { country: "Cuba", international_dialing: "+53" },
            { country: "Cyprus", international_dialing: "+357" },
            { country: "Czech Republic", international_dialing: "+420" },
            { country: "Denmark", international_dialing: "+45" },
            { country: "Djibouti", international_dialing: "+253" },
            { country: "Dominica", international_dialing: "+1-767" },
            { country: "Dominican Republic", international_dialing: "+1-809" },
            { country: "Ecuador", international_dialing: "+593" },
            { country: "Egypt", international_dialing: "+20" },
            { country: "El Salvador", international_dialing: "+503" },
            { country: "Equatorial Guinea", international_dialing: "+240" },
            { country: "Eritrea", international_dialing: "+291" },
            { country: "Estonia", international_dialing: "+372" },
            { country: "Ethiopia", international_dialing: "+251" },
            { country: "Fiji", international_dialing: "+679" },
            { country: "Finland", international_dialing: "+358" },
            { country: "France", international_dialing: "+33" },
            { country: "Gabon", international_dialing: "+241" },
            { country: "Gambia", international_dialing: "+220" },
            { country: "Georgia", international_dialing: "+995" },
            { country: "Germany", international_dialing: "+49" },
            { country: "Ghana", international_dialing: "+233" },
            { country: "Greece", international_dialing: "+30" },
            { country: "Grenada", international_dialing: "+1-473" },
            { country: "Guatemala", international_dialing: "+502" },
            { country: "Guinea", international_dialing: "+224" },
            { country: "Guinea-Bissau", international_dialing: "+245" },
            { country: "Guyana", international_dialing: "+592" },
            { country: "Haiti", international_dialing: "+509" },
            { country: "Honduras", international_dialing: "+504" },
            { country: "Hungary", international_dialing: "+36" },
            { country: "Iceland", international_dialing: "+354" },
            { country: "India", international_dialing: "+91" },
            { country: "Indonesia", international_dialing: "+62" },
            { country: "Iran", international_dialing: "+98" },
            { country: "Iraq", international_dialing: "+964" },
            { country: "Ireland", international_dialing: "+353" },
            { country: "Israel", international_dialing: "+972" },
            { country: "Italy", international_dialing: "+39" },
            { country: "Jamaica", international_dialing: "+1-876" },
            { country: "Japan", international_dialing: "+81" },
            { country: "Jordan", international_dialing: "+962" },
            { country: "Kazakhstan", international_dialing: "+7" },
            { country: "Kenya", international_dialing: "+254" },
            { country: "Kiribati", international_dialing: "+686" },
            { country: "Kosovo", international_dialing: "+383" },
            { country: "Kuwait", international_dialing: "+965" },
            { country: "Kyrgyzstan", international_dialing: "+996" },
            { country: "Laos", international_dialing: "+856" },
            { country: "Latvia", international_dialing: "+371" },
            { country: "Lebanon", international_dialing: "+961" },
            { country: "Lesotho", international_dialing: "+266" },
            { country: "Liberia", international_dialing: "+231" },
            { country: "Libya", international_dialing: "+218" },
            { country: "Liechtenstein", international_dialing: "+423" },
            { country: "Lithuania", international_dialing: "+370" },
            { country: "Luxembourg", international_dialing: "+352" },
            { country: "Macedonia", international_dialing: "+389" },
            { country: "Madagascar", international_dialing: "+261" },
            { country: "Malawi", international_dialing: "+265" },
            { country: "Malaysia", international_dialing: "+60" },
            { country: "Maldives", international_dialing: "+960" },
            { country: "Mali", international_dialing: "+223" },
            { country: "Malta", international_dialing: "+356" },
            { country: "Marshall Islands", international_dialing: "+692" },
            { country: "Mauritania", international_dialing: "+222" },
            { country: "Mauritius", international_dialing: "+230" },
            { country: "Mexico", international_dialing: "+52" },
            { country: "Micronesia", international_dialing: "+691" },
            { country: "Moldova", international_dialing: "+373" },
            { country: "Monaco", international_dialing: "+377" },
            { country: "Mongolia", international_dialing: "+976" },
            { country: "Montenegro", international_dialing: "+382" },
            { country: "Morocco", international_dialing: "+212" },
            { country: "Mozambique", international_dialing: "+258" },
            { country: "Myanmar", international_dialing: "+95" },
            { country: "Namibia", international_dialing: "+264" },
            { country: "Nauru", international_dialing: "+674" },
            { country: "Nepal", international_dialing: "+977" },
            { country: "Netherlands", international_dialing: "+31" },
            { country: "New Zealand", international_dialing: "+64" },
            { country: "Nicaragua", international_dialing: "+505" },
            { country: "Niger", international_dialing: "+227" },
            { country: "Nigeria", international_dialing: "+234" },
            { country: "North Korea", international_dialing: "+850" },
            { country: "Norway", international_dialing: "+47" },
            { country: "Oman", international_dialing: "+968" },
            { country: "Pakistan", international_dialing: "+92" },
            { country: "Palau", international_dialing: "+680" },
            { country: "Palestine", international_dialing: "+970" },
            { country: "Panama", international_dialing: "+507" },
            { country: "Papua New Guinea", international_dialing: "+675" },
            { country: "Paraguay", international_dialing: "+595" },
            { country: "Peru", international_dialing: "+51" },
            { country: "Philippines", international_dialing: "+63" },
            { country: "Poland", international_dialing: "+48" },
            { country: "Portugal", international_dialing: "+351" },
            { country: "Qatar", international_dialing: "+974" },
            { country: "Romania", international_dialing: "+40" },
            { country: "Russia", international_dialing: "+7" },
            { country: "Rwanda", international_dialing: "+250" },
            { country: "Saint Kitts and Nevis", international_dialing: "+1-869" },
            { country: "Saint Lucia", international_dialing: "+1-758" },
            { country: "Saint Vincent and the Grenadines", international_dialing: "+1-784" },
            { country: "Samoa", international_dialing: "+685" },
            { country: "San Marino", international_dialing: "+378" },
            { country: "Sao Tome and Principe", international_dialing: "+239" },
            { country: "Saudi Arabia", international_dialing: "+966" },
            { country: "Senegal", international_dialing: "+221" },
            { country: "Serbia", international_dialing: "+381" },
            { country: "Seychelles", international_dialing: "+248" },
            { country: "Sierra Leone", international_dialing: "+232" },
            { country: "Singapore", international_dialing: "+65" },
            { country: "Slovakia", international_dialing: "+421" },
            { country: "Slovenia", international_dialing: "+386" },
            { country: "Solomon Islands", international_dialing: "+677" },
            { country: "Somalia", international_dialing: "+252" },
            { country: "South Africa", international_dialing: "+27" },
            { country: "South Korea", international_dialing: "+82" },
            { country: "South Sudan", international_dialing: "+211" },
            { country: "Spain", international_dialing: "+34" },
            { country: "Sri Lanka", international_dialing: "+94" },
            { country: "Sudan", international_dialing: "+249" },
            { country: "Suriname", international_dialing: "+597" },
            { country: "Swaziland", international_dialing: "+268" },
            { country: "Sweden", international_dialing: "+46" },
            { country: "Switzerland", international_dialing: "+41" },
            { country: "Syria", international_dialing: "+963" },
            { country: "Taiwan", international_dialing: "+886" },
            { country: "Tajikistan", international_dialing: "+992" },
            { country: "Tanzania", international_dialing: "+255" },
            { country: "Thailand", international_dialing: "+66" },
            { country: "Timor-Leste", international_dialing: "+670" },
            { country: "Togo", international_dialing: "+228" },
            { country: "Tonga", international_dialing: "+676" },
            { country: "Trinidad and Tobago", international_dialing: "+1-868" },
            { country: "Tunisia", international_dialing: "+216" },
            { country: "Turkey", international_dialing: "+90" },
            { country: "Turkmenistan", international_dialing: "+993" },
            { country: "Tuvalu", international_dialing: "+688" },
            { country: "Uganda", international_dialing: "+256" },
            { country: "Ukraine", international_dialing: "+380" },
            { country: "United Arab Emirates", international_dialing: "+971" },
            { country: "United Kingdom", international_dialing: "+44" },
            { country: "United States", international_dialing: "+1" },
            { country: "Uruguay", international_dialing: "+598" },
            { country: "Uzbekistan", international_dialing: "+998" },
            { country: "Vanuatu", international_dialing: "+678" },
            { country: "Vatican City", international_dialing: "+379" },
            { country: "Venezuela", international_dialing: "+58" },
            { country: "Vietnam", international_dialing: "+84" },
            { country: "Yemen", international_dialing: "+967" },
            { country: "Zambia", international_dialing: "+260" },
            { country: "Zimbabwe", international_dialing: "+263" }
          ];
    
          return res.json({
            success: true,
            data: fallbackCountries
          });
        }
      }


}

module.exports=countryController;