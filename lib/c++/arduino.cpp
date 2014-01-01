#include <iostream>
#include <cmath>
#include <unistd.h>

using std::cout;
using std::endl;

int main() {
    srand(getpid());

    while (true) {
        cout << (rand() % 150 - 25) << " " << (rand() % 375 - 125) << endl;
        sleep(1);
    }
}