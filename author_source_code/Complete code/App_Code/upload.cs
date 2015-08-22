using System;
using System.Collections.Generic;
using System.Web;
using System.Web.Services;
using System.IO;
/// <summary>
/// Summary description for upload
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
[System.Web.Script.Services.ScriptService]
public class upload : System.Web.Services.WebService {

    [WebMethod]
    public string uploadFile()
    {
        
        foreach (var file in HttpContext.Current.Request.Files.AllKeys)
        {
            var f = HttpContext.Current.Request.Files[file];
            byte[] binaryWriteArray = new byte[f.InputStream.Length];

            //Read in the file from the InputStream
            f.InputStream.Read(binaryWriteArray, 0, (int)f.InputStream.Length);

            //Open the file stream
            FileStream objfilestream = new FileStream(Server.MapPath("~/App_Data/" + f.FileName), FileMode.Create, FileAccess.ReadWrite);

            //Write the file and close it
            objfilestream.Write(binaryWriteArray, 0, binaryWriteArray.Length);
            objfilestream.Close();
        }

        return "Files uploaded";
    }
}