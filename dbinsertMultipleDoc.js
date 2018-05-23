var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("customerContract");
  var myobj = [
	{
		fname: "dfa",
		lname: "daf",
		email: "theohncom@gmail.com",
		txHash: "0xb4b37823ed8c74d6cd4873f912e491d9e9c27508a70c769675abd60f6aaa44ef",
		selectedFlight: "NH-808",
		f_airport: "BKK",
		t_airport: "NRT",
		d_date: "2018-05-22",
		d_time: "00:30:00.000",
		a_date: "2018-05-22",
		a_time: "08:40:00.000",
		status: "NA"
	},
	{
		fname: "kk",
		lname: "kk",
		email: "theohncom@gmail.com",
		txHash: "0x894e6c03ddb485882c08f682c140198b0b2de5877e4d2030cbc926b668cf6482",
		selectedFlight: "UA-7922",
		f_airport: "NRT",
		t_airport: "BKK",
		d_date: "2018-05-23",
		d_time: "17:00:00.000",
		a_date: "2018-05-23",
		a_time: "21:40:00.000",
		status: "NA"
	},
	{
		fname: "uu",
		lname: "uu",
		email: "theohncom@gmail.com",
		txHash: "0x4950fd47f39e884d514503eb8a044eed537d43337e0e3d00e8c520d6db3ca92f",
		selectedFlight: "NH-806",
		f_airport: "BKK",
		t_airport: "NRT",
		d_date: "2018-05-23",
		d_time: "06:50:00.000",
		a_date: "2018-05-23",
		a_time: "15:00:00.000",
		status: "NA"
	},
	{
		fname: "fadfa",
		lname: "fsdfa",
		email: "theohncom@gmail.com",
		txHash: "0xd1c85dc011eedf391ecf69e462bd9f5993b61f0b10091a983da8fac46daada62",
		selectedFlight: "UA-7968",
		f_airport: "BKK",
		t_airport: "NRT",
		d_date: "2018-05-23",
		d_time: "06:50:00.000",
		a_date: "2018-05-23",
		a_time: "15:00:00.000",
		status: "NA"
	},
	{
		fname: "dfaf",
		lname: "dfadfa",
		email: "theohncom@gmail.com",
		txHash: "0x14abdf487f96f62dde5e0c11f490af912a480a51c53ac24ef0449bdc9e2e8894",
		selectedFlight: "TG-676",
		f_airport: "BKK",
		t_airport: "NRT",
		d_date: "2018-05-24",
		d_time: "07:35:00.000",
		a_date: "2018-05-24",
		a_time: "15:45:00.000",
		status: "NA"
	},
	{
		fname: "dfaf",
		lname: "dfadfa",
		email: "theohncom@gmail.com",
		txHash: "0xef7621a38baa3eb2a362891bbfa617758251a74a44b1b6c88126a472d78dc0f2",
		selectedFlight: "TG-676",
		f_airport: "BKK",
		t_airport: "NRT",
		d_date: "2018-05-24",
		d_time: "07:35:00.000",
		a_date: "2018-05-24",
		a_time: "15:45:00.000",
		status: "NA"
	},
	{
		fname: "dfaf",
		lname: "dfasdf",
		email: "theohncom@gmail.com",
		txHash: "0x7f993fdd28ddf3860002c348937cfb01b68cb619325cb6ad59d8c872eb5d6bf3",
		selectedFlight: "AC-6230",
		f_airport: "BKK",
		t_airport: "NRT",
		d_date: "2018-05-23",
		d_time: "06:50:00.000",
		a_date: "2018-05-23",
		a_time: "15:00:00.000",
		status: "NA"
	}
];
  dbo.collection("customers").insertMany(myobj, function(err, res) {
    if (err) throw err;
    console.log("Number of documents inserted: " + res.insertedCount);
    db.close();
  });
});