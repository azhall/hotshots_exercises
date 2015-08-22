using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Collections;
using System.Data;
using System.Data.SqlClient;
using System.Web.Script.Serialization;

/// <summary>
/// Summary description for heat_map
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
[System.Web.Script.Services.ScriptService]
public class heat_map : System.Web.Services.WebService {

    public class layout
    {
        public string min { get; set; }
        public string max { get; set; }
    }

    public class click
    {
        public string url { get; set; }
        public string x { get; set; }
        public string y { get; set; }
        public string layout { get; set; }
    }

    public class response
    {
        public string x { get; set; }
        public string y { get; set; }
    }

    [WebMethod]
    public void saveLayouts(string url, List<layout> layouts)
    {
        using (SqlConnection dbCon = new SqlConnection("Data Source=desktop-pc\\sqlexpress;Initial Catalog=click manager;Persist Security Info=True;User ID=click_manager;Password=password"))
        {
            //open connection
            dbCon.Open();

            //create read query
            SqlCommand readCommand = new SqlCommand("SELECT url FROM layouts WHERE url = @url", dbCon);

            //parameterize command
            readCommand.Parameters.AddWithValue("@url", url);

            //read from db
            bool stored = false;
            SqlDataReader reader = readCommand.ExecuteReader();
            while (reader.Read())
            {
                if (reader["url"].ToString() == url)
                {
                    stored = true;
                    break;
                }
            }

            //close connection
            dbCon.Close();

            //update db if URL not already stored
            if (stored == false)
            {
                //open connection
                dbCon.Open();

                //process layouts list
                foreach (var layout in layouts)
                {
                    //create write query
                    SqlCommand writeCommand = new SqlCommand("INSERT INTO layouts (url, min, max) VALUES (@url, @min, @max)", dbCon);

                    //parameterize command
                    writeCommand.Parameters.AddWithValue("@url", url);
                    writeCommand.Parameters.AddWithValue("@min", layout.min);
                    writeCommand.Parameters.AddWithValue("@max", layout.max);

                    //write to db
                    writeCommand.ExecuteNonQuery();
                }

                //close connection
                dbCon.Close();
            }
        }
    }

    [WebMethod]
    public void saveClicks (List<click> clicks)
    {
        using (SqlConnection dbCon = new SqlConnection("Data Source=desktop-pc\\sqlexpress;Initial Catalog=click manager;Persist Security Info=True;User ID=click_manager;Password=password"))
        {
            //open connection
            dbCon.Open();

            //process clicks List
            foreach (var click in clicks)
            {
                //create write query
                SqlCommand writeCommand = new SqlCommand("INSERT INTO clicks (url, x, y, layout) VALUES (@url, @x, @y, @layout)", dbCon);

                //parameterize command
                writeCommand.Parameters.AddWithValue("@url", click.url);
                writeCommand.Parameters.AddWithValue("@x", click.x);
                writeCommand.Parameters.AddWithValue("@y", click.y);
                writeCommand.Parameters.AddWithValue("@layout", click.layout);

                //write to db
                writeCommand.ExecuteNonQuery();
            }

            //close connection
            dbCon.Close();
        }
    }

    [WebMethod]
    public ArrayList getLayouts(string url)
    {
        using (SqlConnection dbCon = new SqlConnection("Data Source=desktop-pc\\sqlexpress;Initial Catalog=click manager;Persist Security Info=True;User ID=click_manager;Password=password"))
        {
            //open connection
            dbCon.Open();

            //create reade query
            SqlCommand readCommand = new SqlCommand("SELECT min, max FROM layouts WHERE url = @url", dbCon);
            readCommand.Parameters.AddWithValue("@url", url);

            //create list of results
            ArrayList layouts = new ArrayList();
            SqlDataReader reader = readCommand.ExecuteReader();

            while (reader.Read())
            {
                layout resp = new layout();
                resp.min = reader["min"].ToString();
                resp.max = reader["max"].ToString();

                layouts.Add(resp);
            }

            //close connection
            dbCon.Close();

            //return results
            return layouts;
        }

    }

    [WebMethod]
    public ArrayList getClicks (string url, string layout)
    {
        using (SqlConnection dbCon = new SqlConnection("Data Source=desktop-pc\\sqlexpress;Initial Catalog=click manager;Persist Security Info=True;User ID=click_manager;Password=password"))
        {
            //open connection
            dbCon.Open();

            //create reade query
            SqlCommand readCommand = new SqlCommand("SELECT x, y FROM clicks WHERE url = @url and layout = @layout", dbCon);
            readCommand.Parameters.AddWithValue("@url", url);
            readCommand.Parameters.AddWithValue("@layout", layout);
            
            //create list of results
            ArrayList clicks = new ArrayList();
            SqlDataReader reader = readCommand.ExecuteReader();

            while (reader.Read())
            {
                response resp = new response();
                resp.x = reader["x"].ToString();
                resp.y = reader["y"].ToString();

                clicks.Add(resp);
            }

            //close connection
            dbCon.Close();

            //return results
            return clicks;
        }

    }
}